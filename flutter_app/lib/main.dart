import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // REPLACE WITH YOUR SUPABASE URL & ANON KEY
  // Found in Supabase Dashboard -> Project Settings -> API
  const supabaseUrl = 'https://fvqmdcwvtreqkxsrgisi.supabase.co';
  const supabaseKey = 'sb_publishable_LwXB0Bn1J3QkmwZCinCWkQ_gfVyzdpz';

  try {
    if (!supabaseUrl.contains('YOUR_SUPABASE')) {
      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseKey,
      );
    }
  } catch (e) {
    debugPrint('Supabase offline or not yet configured: $e');
  }

  runApp(const GondarTrafficApp());
}

class GondarTrafficApp extends StatelessWidget {
  const GondarTrafficApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gondar Traffic Bajaj Control',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0C355B),
          primary: const Color(0xFF0C355B),
          secondary: const Color(0xFF185A9D),
        ),
        textTheme: GoogleFonts.notoSansEthiopicTextTheme(
          Theme.of(context).textTheme,
        ),
        scaffoldBackgroundColor: const Color(0xFFF4F7FB),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0C355B),
          foregroundColor: Colors.white,
          elevation: 2,
        ),
      ),
      home: const LoginScreen(),
    );
  }
}
