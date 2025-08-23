import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ViewAllMissionsButton extends StatelessWidget {
  const ViewAllMissionsButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        vertical: 32,
        horizontal: 24,
      ),
      child: ElevatedButton(
        onPressed: () {
          context.push('/missions');
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF089781),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(
            horizontal: 32,
            vertical: 12,
          ),
          minimumSize: const Size(0, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(100),
          ),
          elevation: 0,
        ),
        child: const Text(
          'ミッション一覧へ',
          style: TextStyle(
            fontFamily: 'Noto Sans JP',
            fontSize: 16,
            fontWeight: FontWeight.w700,
            height: 1.5,
            letterSpacing: 0.32,
          ),
        ),
      ),
    );
  }
}