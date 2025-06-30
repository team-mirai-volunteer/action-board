import 'package:flutter/material.dart';

class AuthHeader extends StatelessWidget {
  const AuthHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // ロゴ画像
        Container(
          width: 130,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)),
          child: Image.asset('assets/img/logo.png', fit: BoxFit.cover),
        ),
        const SizedBox(height: 8),
        // タイトル
        Text('アクションボード（α版）', style: Theme.of(context).textTheme.titleMedium),
      ],
    );
  }
}
