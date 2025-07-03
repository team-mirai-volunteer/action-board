import 'package:flutter/material.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';

class CustomTextFormField extends StatelessWidget {
  final TextEditingController? controller;
  final String? initialValue;
  final String? hintText;
  final String? labelText;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final void Function()? onTap;
  final TextInputType? keyboardType;
  final bool obscureText;
  final bool readOnly;
  final Widget? suffixIcon;
  final int maxLines;
  final TextStyle? style;
  final bool autofocus;

  const CustomTextFormField({
    super.key,
    this.controller,
    this.initialValue,
    this.hintText,
    this.labelText,
    this.validator,
    this.onChanged,
    this.onTap,
    this.keyboardType,
    this.obscureText = false,
    this.readOnly = false,
    this.suffixIcon,
    this.maxLines = 1,
    this.style,
    this.autofocus = false,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      initialValue: initialValue,
      validator: validator,
      onChanged: onChanged,
      onTap: onTap,
      keyboardType: keyboardType,
      obscureText: obscureText,
      readOnly: readOnly,
      maxLines: maxLines,
      autofocus: autofocus,
      style:
          style ??
          Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: readOnly ? const Color(0xFF292524) : AppColors.textSecondary,
          ),
      decoration: InputDecoration(
        hintText: hintText,
        labelText: labelText,
        hintStyle: Theme.of(
          context,
        ).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
        filled: readOnly,
        fillColor: readOnly ? const Color(0xFFF9F9F9) : null,
        contentPadding: const EdgeInsets.only(
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        ),
        suffixIcon: suffixIcon,
        // エラー表示時の高さを固定するための設定
        helperText: ' ', // 常に空のヘルパーテキストでスペースを確保
        helperMaxLines: 1,
        errorMaxLines: 2,
        // 高さの制約を解除してエラー表示時も適切な高さを保つ
        constraints: const BoxConstraints(
          minHeight: 48, // 最小高さを設定
        ),
        isDense: false,
        // ボーダーのスタイル
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: BorderSide(
            color: readOnly
                ? AppColors.borderTertiary
                : AppColors.textQuaternary,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: BorderSide(
            color: readOnly
                ? AppColors.borderTertiary
                : AppColors.textQuaternary,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: AppColors.error, width: 2),
        ),
      ),
    );
  }
}
