package com.example.FinFlow.service;

import com.example.FinFlow.model.Transaction;
import com.example.FinFlow.model.TransactionType;
import com.example.FinFlow.model.Account;
import com.example.FinFlow.model.Category;
import com.example.FinFlow.repository.TransactionRepository;
import com.example.FinFlow.repository.AccountRepository;
import com.example.FinFlow.repository.CategoryRepository;

import com.google.genai.Client;
import com.google.genai.types.*;
import com.google.common.collect.ImmutableList;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatbotService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private Client geminiClient;
    private boolean useOfflineMode = false;
    private static final String MODEL = "gemini-3-flash-preview";

    @PostConstruct
    public void init() {
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                geminiClient = Client.builder().apiKey(geminiApiKey.trim()).build();
            } catch (Exception e) {
                System.err.println("Failed to initialize Gemini client: " + e.getMessage());
                useOfflineMode = true;
            }
        } else {
            useOfflineMode = true;
        }
    }

    public String handleChat(String userMessage, Long userId, MultipartFile image) {
        // Try offline processing first for known commands
        String offlineResult = handleOffline(userMessage, userId);
        if (offlineResult != null) {
            return offlineResult;
        }

        // If client is unavailable or offline mode is active, use fallback
        if (geminiClient == null || useOfflineMode) {
            return handleOfflineFallback(userMessage, userId);
        }

        // Try Gemini API via official SDK
        List<Category> allUserCategories = categoryRepository.findByUser_UserIdOrUserIsNull(userId);
        List<String> catNames = new ArrayList<>();
        for (Category c : allUserCategories) {
            if (c.getName() != null)
                catNames.add("'" + c.getName() + "'");
        }
        String availableCategories = String.join(", ", catNames);

        List<Account> allUserAccounts = accountRepository.findByUser_UserId(userId);
        List<String> accNames = new ArrayList<>();
        for (Account a : allUserAccounts) {
            if (a.getAccountName() != null)
                accNames.add("'" + a.getAccountName() + "'");
        }
        String availableAccounts = String.join(", ", accNames);

        String prompt = "You are FinFlow Assistant, a financial expert. " +
                "User ID: " + userId + ". Access to user financial data is implied. " +
                "You can help manage transactions. " +
                "If an image (receipt, bill, etc.) is provided, extract the transaction details (amount, note) using OCR and format it as an ADD_TRX tag. "
                +
                "If user wants to add, edit or delete, you must respond with a TAG at the start of your message followed by the actual text for the user. "
                +
                "When adding a transaction, provide a short, appropriate Category name. Try to pick from existing ones: ["
                + availableCategories + "]. If none fits well, use 'Others'. " +
                "Also provide a matched Account name from: [" + availableAccounts + "]. If not explicitly mentioned by user, pick the most logically fitting one (e.g. Bank for large amounts or Cash for small expenses). " +
                "Tags: \n" +
                "- [ADD_TRX:amount:type:category:account:note]: type must be INCOME or EXPENSE.\n" +
                "- [DELETE_TRX:id]\n" +
                "- [SUMMARY]\n" +
                "Example: '[ADD_TRX:50000:EXPENSE:Food:Cash:Coffee] Got it! I've added a coffee expense of 50.000đ for you.' "
                +
                "Now respond to: " + userMessage;

        try {
            List<Part> requestParts = new ArrayList<>();
            requestParts.add(Part.fromText(prompt));

            if (image != null && !image.isEmpty()) {
                requestParts.add(Part.builder()
                        .inlineData(Blob.builder()
                                .mimeType(image.getContentType())
                                .data(image.getBytes())
                                .build())
                        .build());
            }

            List<Content> contents = ImmutableList.of(
                    Content.builder()
                            .role("user")
                            .parts(requestParts)
                            .build());

            GenerateContentConfig config = GenerateContentConfig.builder().build();

            GenerateContentResponse response = geminiClient.models.generateContent(MODEL, contents, config);

            if (response.candidates() != null && response.candidates().isPresent()
                    && !response.candidates().get().isEmpty()) {
                Candidate candidate = response.candidates().get().get(0);
                if (candidate.content() != null && candidate.content().isPresent()
                        && candidate.content().get().parts() != null
                        && candidate.content().get().parts().isPresent()) {
                    List<Part> parts = candidate.content().get().parts().get();
                    StringBuilder sb = new StringBuilder();
                    for (Part part : parts) {
                        if (part.text() != null && part.text().isPresent()) {
                            sb.append(part.text().get());
                        }
                    }
                    String aiResponse = sb.toString().trim();
                    if (!aiResponse.isEmpty()) {
                        return processActions(aiResponse, userId);
                    }
                }
            }
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "";
            if (errorMsg.contains("429") || errorMsg.contains("quota") || errorMsg.contains("RESOURCE_EXHAUSTED")) {
                useOfflineMode = true;
                return "⚠️ API Gemini đã hết quota. Đã chuyển sang **chế độ offline**. Bạn vẫn có thể:\n" +
                        "• Thêm giao dịch: \"thêm chi 50000 cà phê\" hoặc \"thêm thu 1000000 lương\"\n" +
                        "• Xóa giao dịch: \"xóa giao dịch 5\"\n" +
                        "• Xem tổng kết: \"tổng kết\" hoặc \"báo cáo\"";
            }
            // For other errors, try offline fallback
            return handleOfflineFallback(userMessage, userId);
        }
        return "Tôi không thể xử lý yêu cầu lúc này.";
    }

    /**
     * Handle known command patterns directly (works both online and offline)
     */
    private String handleOffline(String userMessage, Long userId) {
        String msg = userMessage.trim().toLowerCase();

        // --- HELP ---
        if (msg.equals("help") || msg.equals("trợ giúp") || msg.equals("hướng dẫn")) {
            return "🤖 **FinFlow Assistant - Hướng dẫn sử dụng:**\n\n" +
                    "📌 **Thêm chi tiêu:**\n" +
                    "   • \"thêm chi 50000 cà phê\"\n" +
                    "   • \"chi 200000 ăn trưa\"\n\n" +
                    "📌 **Thêm thu nhập:**\n" +
                    "   • \"thêm thu 5000000 lương tháng 4\"\n" +
                    "   • \"thu 1000000 freelance\"\n\n" +
                    "📌 **Xóa giao dịch:**\n" +
                    "   • \"xóa giao dịch 12\"\n" +
                    "   • \"xóa 5\"\n\n" +
                    "📌 **Tổng kết:**\n" +
                    "   • \"tổng kết\"\n" +
                    "   • \"báo cáo\"\n\n" +
                    (useOfflineMode ? "⚡ Đang ở chế độ offline (API hết quota)" : "🟢 API Gemini đang hoạt động");
        }

        // --- ADD EXPENSE: "chi 50000 cà phê" or "thêm chi 50000 cà phê" ---
        Pattern expensePattern = Pattern.compile(
                "(?:thêm\\s+)?chi(?:\\s+tiêu)?\\s+(\\d+[\\d.,]*)\\s+(.+)",
                Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
        Matcher expenseMatcher = expensePattern.matcher(msg);
        if (expenseMatcher.find()) {
            String amountStr = expenseMatcher.group(1).replaceAll("[.,]", "");
            String note = expenseMatcher.group(2).trim();
            return addTransaction(amountStr, TransactionType.EXPENSE, note, userId);
        }

        // --- ADD INCOME: "thu 1000000 lương" or "thêm thu 1000000 lương" ---
        Pattern incomePattern = Pattern.compile(
                "(?:thêm\\s+)?thu(?:\\s+nhập)?\\s+(\\d+[\\d.,]*)\\s+(.+)",
                Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
        Matcher incomeMatcher = incomePattern.matcher(msg);
        if (incomeMatcher.find()) {
            String amountStr = incomeMatcher.group(1).replaceAll("[.,]", "");
            String note = incomeMatcher.group(2).trim();
            return addTransaction(amountStr, TransactionType.INCOME, note, userId);
        }

        // --- DELETE: "xóa giao dịch 5" or "xóa 5" ---
        Pattern deletePattern = Pattern.compile(
                "xóa(?:\\s+giao\\s+dịch)?\\s+(\\d+)",
                Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
        Matcher deleteMatcher = deletePattern.matcher(msg);
        if (deleteMatcher.find()) {
            Long id = Long.parseLong(deleteMatcher.group(1));
            return deleteTransaction(id);
        }

        // --- SUMMARY: "tổng kết" or "báo cáo" ---
        if (msg.contains("tổng kết") || msg.contains("báo cáo") || msg.contains("summary")
                || msg.contains("thống kê")) {
            return generateSummary(userId);
        }

        return null; // Not a recognized command
    }

    /**
     * Fallback when API is unavailable
     */
    private String handleOfflineFallback(String userMessage, Long userId) {
        String result = handleOffline(userMessage, userId);
        if (result != null) {
            return result;
        }

        return "🤖 Xin chào! Tôi là FinFlow Assistant (**chế độ offline**).\n\n" +
                "Hiện tại tôi có thể giúp bạn:\n" +
                "• **Thêm chi tiêu**: \"chi 50000 cà phê\"\n" +
                "• **Thêm thu nhập**: \"thu 5000000 lương\"\n" +
                "• **Xóa giao dịch**: \"xóa giao dịch 5\"\n" +
                "• **Tổng kết**: \"tổng kết\"\n\n" +
                "Gõ **help** để xem hướng dẫn chi tiết!";
    }

    private String addTransaction(String amountStr, TransactionType type, String note, Long userId) {
        try {
            BigDecimal amount = new BigDecimal(amountStr);
            List<Account> accounts = accountRepository.findByUser_UserId(userId);
            List<Category> allCategories = categoryRepository.findByUser_UserIdOrUserIsNull(userId);
            List<Category> matchingCategories = new ArrayList<>();
            for (Category c : allCategories) {
                if (c.getType() == type) {
                    matchingCategories.add(c);
                }
            }

            if (accounts.isEmpty()) {
                return "❌ Bạn chưa có tài khoản nào. Vui lòng tạo tài khoản trước.";
            }
            if (matchingCategories.isEmpty()) {
                return "❌ Không tìm thấy danh mục cho loại giao dịch này.";
            }

            // Find best matching category by name and keywords
            Category selectedCategory = findBestCategoryMatch(matchingCategories, note);

            Transaction t = new Transaction();
            t.setAmount(amount);
            t.setType(type);
            t.setNote(note);
            t.setTransactionDate(LocalDateTime.now());
            t.setAccount(accounts.get(0));
            t.setCategory(selectedCategory);
            transactionRepository.save(t);

            String typeLabel = type == TransactionType.INCOME ? "thu nhập" : "chi tiêu";
            String formattedAmount = formatCurrency(amount);

            return "✅ Đã thêm " + typeLabel + ": **" + formattedAmount + "** - " + note;
        } catch (Exception e) {
            return "❌ Lỗi khi thêm giao dịch: " + e.getMessage();
        }
    }

    private String deleteTransaction(Long id) {
        try {
            if (transactionRepository.existsById(id)) {
                transactionRepository.deleteById(id);
                return "✅ Đã xóa giao dịch ID **" + id + "** thành công!";
            } else {
                return "❌ Không tìm thấy giao dịch ID " + id + ".";
            }
        } catch (Exception e) {
            return "❌ Lỗi khi xóa giao dịch: " + e.getMessage();
        }
    }

    private String generateSummary(Long userId) {
        try {
            List<Account> accounts = accountRepository.findByUser_UserId(userId);
            if (accounts.isEmpty()) {
                return "📊 Bạn chưa có tài khoản nào.";
            }

            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpense = BigDecimal.ZERO;
            int incomeCount = 0;
            int expenseCount = 0;

            for (Account account : accounts) {
                List<Transaction> transactions = transactionRepository
                        .findByAccount_AccountId(account.getAccountId());
                for (Transaction t : transactions) {
                    if (t.getType() == TransactionType.INCOME) {
                        totalIncome = totalIncome.add(t.getAmount());
                        incomeCount++;
                    } else {
                        totalExpense = totalExpense.add(t.getAmount());
                        expenseCount++;
                    }
                }
            }

            BigDecimal balance = totalIncome.subtract(totalExpense);

            return "📊 **Tổng kết tài chính:**\n\n" +
                    "💰 Thu nhập: **" + formatCurrency(totalIncome) + "** (" + incomeCount + " giao dịch)\n" +
                    "💸 Chi tiêu: **" + formatCurrency(totalExpense) + "** (" + expenseCount + " giao dịch)\n" +
                    "━━━━━━━━━━━━━━━━━━\n" +
                    (balance.compareTo(BigDecimal.ZERO) >= 0
                            ? "🟢 Số dư: **+" + formatCurrency(balance) + "**"
                            : "🔴 Thâm hụt: **" + formatCurrency(balance) + "**");
        } catch (Exception e) {
            return "❌ Lỗi khi tạo báo cáo: " + e.getMessage();
        }
    }

    private String formatCurrency(BigDecimal amount) {
        NumberFormat nf = NumberFormat.getInstance(Locale.of("vi", "VN"));
        return nf.format(amount) + "đ";
    }

    private String processActions(String aiResponse, Long userId) {
        Pattern addPattern = Pattern.compile("\\[ADD_TRX:(\\d+):(\\w+):([^:]+):([^:]+):(.+?)\\]");
        Matcher addMatcher = addPattern.matcher(aiResponse);
        if (addMatcher.find()) {
            try {
                BigDecimal amount = new BigDecimal(addMatcher.group(1));
                TransactionType type = TransactionType.valueOf(addMatcher.group(2));
                String categoryName = addMatcher.group(3).trim();
                String accountName = addMatcher.group(4).trim();
                String note = addMatcher.group(5).trim();

                List<Account> accounts = accountRepository.findByUser_UserId(userId);
                List<Category> allCategories = categoryRepository.findByUser_UserIdOrUserIsNull(userId);

                if (!accounts.isEmpty()) {
                    Category selectedCategory = null;

                    // 1. Try to find an exact or case-insensitive match from user's current
                    // categories
                    for (Category c : allCategories) {
                        if (c.getType() == type && c.getName() != null && c.getName().equalsIgnoreCase(categoryName)) {
                            selectedCategory = c;
                            break;
                        }
                    }

                    // 2. If the AI defined a new category that doesn't exist, fallback to "Others"
                    if (selectedCategory == null) {
                        for (Category c : allCategories) {
                            if (c.getType() == type && c.getName() != null && c.getName().equalsIgnoreCase("Others")) {
                                selectedCategory = c;
                                break;
                            }
                        }

                        // If "Others" doesn't exist yet, create it dynamically
                        if (selectedCategory == null) {
                            selectedCategory = new Category();
                            selectedCategory.setName("Others");
                            selectedCategory.setType(type);
                            selectedCategory.setUser(accounts.get(0).getUser());
                            selectedCategory = categoryRepository.save(selectedCategory);
                        }
                    }
                    
                    Account selectedAccount = accounts.get(0); // Fallback
                    for (Account a : accounts) {
                        if (a.getAccountName() != null && a.getAccountName().equalsIgnoreCase(accountName)) {
                            selectedAccount = a;
                            break;
                        }
                    }

                    Transaction t = new Transaction();
                    t.setAmount(amount);
                    t.setType(type);
                    t.setNote(note);
                    t.setTransactionDate(LocalDateTime.now());
                    t.setAccount(selectedAccount);
                    t.setCategory(selectedCategory);
                    transactionRepository.save(t);
                    return aiResponse.replaceAll("\\[.*?\\]", "").trim() + " (Hệ thống đã ghi nhận giao dịch!)";
                }
            } catch (Exception e) {
                return aiResponse.replaceAll("\\[.*?\\]", "").trim() + " (Lỗi xử lý AI: " + e.getMessage() + ")";
            }
        }

        Pattern delPattern = Pattern.compile("\\[DELETE_TRX:(\\d+)\\]");
        Matcher delMatcher = delPattern.matcher(aiResponse);
        if (delMatcher.find()) {
            try {
                Long id = Long.parseLong(delMatcher.group(1));
                transactionRepository.deleteById(id);
                return aiResponse.replaceAll("\\[.*?\\]", "").trim() + " (Đã xóa giao dịch ID " + id + ".)";
            } catch (Exception e) {
                return aiResponse.replaceAll("\\[.*?\\]", "").trim() + " (Không tìm thấy giao dịch để xóa.)";
            }
        }

        return aiResponse.replaceAll("\\[.*?\\]", "").trim();
    }

    private Category findBestCategoryMatch(List<Category> categories, String note) {
        if (categories.isEmpty())
            return null;

        // Normalize Unicode (NFD to NFC) to fix mismatch with AI responses
        String normalizedNote = java.text.Normalizer.normalize(note, java.text.Normalizer.Form.NFC);
        String lowerNote = normalizedNote.toLowerCase().trim();

        // Clean punctuation to make space-padded matching reliable
        String cleanNote = lowerNote.replaceAll("[^\\p{L}\\p{Nd}\\s]", " ");
        String paddedNote = " " + cleanNote + " ";

        // 1. Direct name match
        for (Category c : categories) {
            if (c.getName() == null)
                continue;
            String catName = c.getName().toLowerCase();
            if (lowerNote.contains(catName) || catName.contains(lowerNote)) {
                return c;
            }
        }

        // 2. Keyword mapping for common categories
        Map<String, List<String>> keywordMap = new HashMap<>();
        // Transport
        List<String> transportKws = Arrays.asList("xăng", "xe", "nhớt", "grab", "taxi", "bus", "xe bus", "xe buýt",
                "gửi xe", "rửa xe", "đi lại", "di chuyển");
        keywordMap.put("transport", transportKws);
        keywordMap.put("đi lại", transportKws);
        keywordMap.put("xe cộ", transportKws);

        // Food & Dining
        List<String> foodKws = Arrays.asList("cà phê", "cafe", "trà sữa", "ăn", "uống", "phở", "bún", "cơm", "tiệc",
                "nhậu", "thức ăn", "siêu thị", "đồ ăn");
        keywordMap.put("food", foodKws);
        keywordMap.put("ăn uống", foodKws);

        // Utilities & Bills
        List<String> utilKws = Arrays.asList("điện", "nước", "mạng", "internet", "wifi", "rác", "tiền nhà", "trọ",
                "hóa đơn", "cáp");
        keywordMap.put("utilities", utilKws);
        keywordMap.put("hóa đơn", utilKws);
        keywordMap.put("điện nước", utilKws);

        // Shopping
        List<String> shoppingKws = Arrays.asList("quần", "áo", "giày", "dép", "mua", "shopee", "lazada", "tiki",
                "mỹ phẩm", "skincare", "tạp hóa");
        keywordMap.put("shopping", shoppingKws);
        keywordMap.put("mua sắm", shoppingKws);

        // Health
        List<String> healthKws = Arrays.asList("thuốc", "khám", "bệnh", "y tế", "sức khỏe", "phòng gym", "yoga");
        keywordMap.put("health", healthKws);
        keywordMap.put("sức khỏe", healthKws);

        // Income/Salary
        List<String> salaryKws = Arrays.asList("lương", "thưởng", "ứng", "tiền công");
        keywordMap.put("salary", salaryKws);
        keywordMap.put("lương", salaryKws);

        // Check keywords safely
        for (Category c : categories) {
            if (c.getName() == null)
                continue;
            String catName = c.getName().toLowerCase();

            for (Map.Entry<String, List<String>> entry : keywordMap.entrySet()) {
                String mappedCategory = entry.getKey();
                // If the real category name contains mapped key, apply rules
                if (catName.contains(mappedCategory)) {
                    for (String kw : entry.getValue()) {
                        String paddedKw = " " + kw + " ";
                        if (paddedNote.contains(paddedKw)) {
                            return c;
                        }
                    }
                }
            }
        }

        // 3. Fallback to first category if no match
        return categories.get(0);
    }
}
