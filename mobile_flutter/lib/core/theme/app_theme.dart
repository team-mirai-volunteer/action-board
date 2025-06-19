import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static TextTheme _buildTextTheme(TextTheme base) {
    return GoogleFonts.notoSansJpTextTheme(base).copyWith(
      // Display styles
      displayLarge: GoogleFonts.notoSansJp(
        fontSize: 57,
        fontWeight: FontWeight.w400,
      ),
      displayMedium: GoogleFonts.notoSansJp(
        fontSize: 45,
        fontWeight: FontWeight.w400,
      ),
      displaySmall: GoogleFonts.notoSansJp(
        fontSize: 36,
        fontWeight: FontWeight.w400,
      ),
      // Headline styles
      headlineLarge: GoogleFonts.notoSansJp(
        fontSize: 32,
        fontWeight: FontWeight.w400,
      ),
      headlineMedium: GoogleFonts.notoSansJp(
        fontSize: 28,
        fontWeight: FontWeight.w400,
      ),
      headlineSmall: GoogleFonts.notoSansJp(
        fontSize: 24,
        fontWeight: FontWeight.w400,
      ),
      // Title styles
      titleLarge: GoogleFonts.notoSansJp(
        fontSize: 22,
        fontWeight: FontWeight.w500,
      ),
      titleMedium: GoogleFonts.notoSansJp(
        fontSize: 16,
        fontWeight: FontWeight.w500,
      ),
      titleSmall: GoogleFonts.notoSansJp(
        fontSize: 14,
        fontWeight: FontWeight.w500,
      ),
      // Body styles
      bodyLarge: GoogleFonts.notoSansJp(
        fontSize: 16,
        fontWeight: FontWeight.w400,
      ),
      bodyMedium: GoogleFonts.notoSansJp(
        fontSize: 14,
        fontWeight: FontWeight.w400,
      ),
      bodySmall: GoogleFonts.notoSansJp(
        fontSize: 12,
        fontWeight: FontWeight.w400,
      ),
      // Label styles
      labelLarge: GoogleFonts.notoSansJp(
        fontSize: 14,
        fontWeight: FontWeight.w500,
      ),
      labelMedium: GoogleFonts.notoSansJp(
        fontSize: 12,
        fontWeight: FontWeight.w500,
      ),
      labelSmall: GoogleFonts.notoSansJp(
        fontSize: 11,
        fontWeight: FontWeight.w500,
      ),
    );
  }

  static ThemeData get lightTheme {
    final TextTheme textTheme = _buildTextTheme(ThemeData.light().textTheme);
    
    return ThemeData(
      useMaterial3: false,
      textTheme: textTheme,
      primarySwatch: const MaterialColor(0xFF089781, {
        50: Color(0xFFE1F5F2),
        100: Color(0xFFB3E5DE),
        200: Color(0xFF81D4C8),
        300: Color(0xFF4FC3B2),
        400: Color(0xFF29B6A1),
        500: Color(0xFF089781),
        600: Color(0xFF078A79),
        700: Color(0xFF067A6E),
        800: Color(0xFF056B64),
        900: Color(0xFF034E51),
      }),
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
        contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1, color: Color(0xFF089781)),
        ),
        constraints: const BoxConstraints(minHeight: 40, maxHeight: 40),
        labelStyle: textTheme.bodyLarge,
        floatingLabelStyle: textTheme.bodyLarge,
      ),
    );
  }

  static ThemeData get darkTheme {
    final TextTheme textTheme = _buildTextTheme(ThemeData.dark().textTheme);
    
    return ThemeData(
      useMaterial3: false,
      brightness: Brightness.dark,
      textTheme: textTheme,
      primarySwatch: const MaterialColor(0xFF089781, {
        50: Color(0xFFE1F5F2),
        100: Color(0xFFB3E5DE),
        200: Color(0xFF81D4C8),
        300: Color(0xFF4FC3B2),
        400: Color(0xFF29B6A1),
        500: Color(0xFF089781),
        600: Color(0xFF078A79),
        700: Color(0xFF067A6E),
        800: Color(0xFF056B64),
        900: Color(0xFF034E51),
      }),
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
        contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(width: 1, color: Color(0xFF089781)),
        ),
        constraints: const BoxConstraints(minHeight: 40, maxHeight: 40),
        labelStyle: textTheme.bodyLarge,
        floatingLabelStyle: textTheme.bodyLarge,
        isDense: true,
      ),
    );
  }
}