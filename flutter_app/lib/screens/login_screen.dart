import 'package:flutter/material.dart';
import '../services/supabase_service.dart';
import 'app_shell.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    OfficerSession? officer;
    String? error;
    try {
      officer = await SupabaseService.loginOfficer(
        _usernameController.text,
        _passwordController.text,
      );
      if (officer == null) {
        error = 'የተጠቃሚ ስም ወይም የይለፍ ቃል የተሳሳተ ነው (Invalid credentials)';
      }
    } catch (e) {
      debugPrint('Login error: $e');
      error = 'ከሰርቨሩ ጋር መገናኘት አልተቻለም። ኢንተርኔት ያረጋግጡ (Cannot reach server – check internet)';
    }

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      _errorMessage = error;
    });

    final signedIn = officer;
    if (signedIn != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => AppShell(
            officerName: signedIn.fullName,
            badgeNumber: signedIn.badgeNumber,
            officerRole: signedIn.role,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF07213A),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Official Shield Logo
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.35),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Image.asset(
                      'assets/images/app_logo.png',
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(Icons.verified_user, color: Colors.amber, size: 48),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                const Text(
                  'የጎንደር ከተማ አስተዳደር',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white70,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Text(
                  'የትራፊክ እና ትራንስፖርት መምሪያ',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const Text(
                  'Gondar City Traffic & Bajaj Verification System',
                  style: TextStyle(fontSize: 11, color: Colors.blueAccent),
                ),
                const SizedBox(height: 24),

                // Login Card
                Container(
                  padding: const EdgeInsets.all(22.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 25,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.lock, size: 18, color: Color(0xFF0C355B)),
                          SizedBox(width: 8),
                          Text(
                            'የፍተሻ መኮንን መግቢያ (Officer Login)',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0C355B),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      TextField(
                        controller: _usernameController,
                        decoration: InputDecoration(
                          labelText: 'የተጠቃሚ ስም (Username)',
                          prefixIcon: const Icon(Icons.person, size: 20),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          filled: true,
                          fillColor: const Color(0xFFF9FBFC),
                        ),
                      ),
                      const SizedBox(height: 14),

                      TextField(
                        controller: _passwordController,
                        obscureText: true,
                        onSubmitted: (_) {
                          if (!_isLoading) _handleLogin();
                        },
                        decoration: InputDecoration(
                          labelText: 'የይለፍ ቃል (Password)',
                          prefixIcon: const Icon(Icons.vpn_key, size: 20),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          filled: true,
                          fillColor: const Color(0xFFF9FBFC),
                        ),
                      ),

                      if (_errorMessage != null) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.red.shade200),
                          ),
                          child: Text(
                            _errorMessage!,
                            style: TextStyle(color: Colors.red.shade900, fontSize: 11),
                          ),
                        ),
                      ],

                      const SizedBox(height: 20),

                      ElevatedButton(
                        onPressed: _isLoading ? null : _handleLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0C355B),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          elevation: 2,
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Text(
                                'ግባ (Sign In)',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
