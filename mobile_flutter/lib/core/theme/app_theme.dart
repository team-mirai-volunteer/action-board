import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // カラー定義
  static const Color primary = Color(0xFF089781);
  static const Color secondary = Color(0xFF31BCA7);
  static const Color error = Color(0xFFFE6764);
  static const Color warning = Color(0xFFF59E0B);
  static const Color success = Color(0xFF10B981);
  static const Color info = Color(0xFF3B82F6);
  
  // グラデーション
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment(-0.0, -0.37),
    end: Alignment(1.0, 0.65),
    colors: [Color(0xFF64D8C6), Color(0xFFBCECD3)],
    stops: [0.013, 1.0],
  );
  
  // テキストカラー
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF52525B);
  static const Color textTertiary = Color(0xFF71717A);
  static const Color textQuaternary = Color(0xFFA1A1AA);
  
  // 背景色
  static const Color backgroundPrimary = Colors.white;
  static const Color backgroundSecondary = Color(0xFFF5F5F5);
  static const Color backgroundTertiary = Color(0xFFF8F8F8);
  static const Color backgroundCard = Colors.white;
  
  // ボーダーカラー
  static const Color borderPrimary = Color(0xFFE5E5E5);
  static const Color borderSecondary = Color(0xFFEBEBEB);
  static const Color borderTertiary = Color(0xFFE2E8F0);
  
  // その他の色
  static const Color divider = Color(0xFFEBEBEB);
  static const Color shadow = Colors.black;
}

class AppTheme {

  static TextTheme _buildTextTheme(TextTheme base) {
    return GoogleFonts.notoSansJpTextTheme(base).copyWith(
      // Display styles - 大きな見出し
      displayLarge: GoogleFonts.notoSansJp(
        fontSize: 52,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      displayMedium: GoogleFonts.notoSansJp(
        fontSize: 48,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      displaySmall: GoogleFonts.notoSansJp(
        fontSize: 36,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      // Headline styles - 見出し
      headlineLarge: GoogleFonts.notoSansJp(
        fontSize: 30,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      headlineMedium: GoogleFonts.notoSansJp(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      headlineSmall: GoogleFonts.notoSansJp(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      // Title styles - タイトル
      titleLarge: GoogleFonts.notoSansJp(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      titleMedium: GoogleFonts.notoSansJp(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      titleSmall: GoogleFonts.notoSansJp(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      // Body styles - 本文
      bodyLarge: GoogleFonts.notoSansJp(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      bodyMedium: GoogleFonts.notoSansJp(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      bodySmall: GoogleFonts.notoSansJp(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      // Label styles - ラベル
      labelLarge: GoogleFonts.notoSansJp(
        fontSize: 14,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
      labelMedium: GoogleFonts.notoSansJp(
        fontSize: 12,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.017,
      ),
      labelSmall: GoogleFonts.notoSansJp(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
        letterSpacing: 0.02,
      ),
    );
  }

  static ThemeData get lightTheme {
    final TextTheme textTheme = _buildTextTheme(ThemeData.light().textTheme);
    
    return ThemeData(
      useMaterial3: false,
      textTheme: textTheme,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        error: AppColors.error,
        surface: AppColors.backgroundCard,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onError: Colors.white,
        onSurface: AppColors.textPrimary,
      ),
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.backgroundPrimary,
      dividerColor: AppColors.divider,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(double.infinity, 40),
          fixedSize: const Size(double.infinity, 40),
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          textStyle: textTheme.titleMedium,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          textStyle: textTheme.bodyLarge,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1, color: AppColors.textQuaternary),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1, color: AppColors.textQuaternary),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 2, color: AppColors.primary),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1, color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 2, color: AppColors.error),
        ),
        // エラー表示時も高さが変わらないようにする
        constraints: const BoxConstraints(minHeight: 48),
        isDense: false,
        // エラーとヘルパーテキストのスタイル
        helperMaxLines: 1,
        errorMaxLines: 2,
        labelStyle: textTheme.bodyLarge,
        floatingLabelStyle: textTheme.bodyLarge?.copyWith(color: AppColors.primary),
        hintStyle: textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
        errorStyle: textTheme.bodySmall?.copyWith(color: AppColors.error),
        helperStyle: textTheme.bodySmall,
      ),
    );
  }

  static ThemeData get darkTheme {
    final TextTheme textTheme = _buildTextTheme(ThemeData.dark().textTheme);
    
    return ThemeData(
      useMaterial3: false,
      brightness: Brightness.dark,
      textTheme: textTheme,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        error: AppColors.error,
        surface: AppColors.backgroundCard,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onError: Colors.white,
        onSurface: AppColors.textPrimary,
      ),
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.backgroundPrimary,
      dividerColor: AppColors.divider,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(double.infinity, 40),
          fixedSize: const Size(double.infinity, 40),
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          textStyle: textTheme.titleMedium,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          textStyle: textTheme.bodyLarge,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1, color: AppColors.textQuaternary),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1, color: AppColors.textQuaternary),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 2, color: AppColors.primary),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1, color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 2, color: AppColors.error),
        ),
        // エラー表示時も高さが変わらないようにする
        constraints: const BoxConstraints(minHeight: 48),
        isDense: false,
        // エラーとヘルパーテキストのスタイル
        helperMaxLines: 1,
        errorMaxLines: 2,
        labelStyle: textTheme.bodyLarge,
        floatingLabelStyle: textTheme.bodyLarge?.copyWith(color: AppColors.primary),
        hintStyle: textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
        errorStyle: textTheme.bodySmall?.copyWith(color: AppColors.error),
        helperStyle: textTheme.bodySmall,
      ),
    );
  }
}