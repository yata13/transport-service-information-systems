import 'package:flutter/material.dart';
import '../services/supabase_service.dart';

class SettingsScreen extends StatefulWidget {
  final String officerName;
  final String badgeNumber;
  final VoidCallback onLogout;

  const SettingsScreen({
    super.key,
    required this.officerName,
    required this.badgeNumber,
    required this.onLogout,
  });

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String _language = 'dual';

  @override
  Widget build(BuildContext context) {
    final isConnected = SupabaseService.isConnected;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Officer Identity Card
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0C355B),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.person, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.officerName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        Text(
                          'መለያ: ${widget.badgeNumber}',
                          style: const TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                        const SizedBox(height: 2),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'የጎንደር ከተማ ትራፊክ ቁጥጥር መኮንን',
                            style: TextStyle(fontSize: 9, color: Colors.blue.shade900, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Database & Sync Status
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('የዳታቤዝ ሁኔታ (Database Status)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(
                        isConnected ? Icons.cloud_done : Icons.storage,
                        color: isConnected ? Colors.green : Colors.blue.shade800,
                        size: 24,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isConnected ? 'ከማዕከላዊ ዳታቤዝ ጋር ተገናኝቷል (Central Database Online)' : 'ከአካባቢያዊ ዳታቤዝ ጋር እየሰራ ነው (Local Offline Ready)',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                                color: isConnected ? Colors.green.shade800 : const Color(0xFF0C355B),
                              ),
                            ),
                            const Text(
                              'ኢንተርኔት በማይኖርበት ጊዜም ፍተሻው ሙሉ በሙሉ ይሰራል',
                              style: TextStyle(fontSize: 10, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Language Setting
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ቋንቋ (Language Preference)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 10),
                  RadioListTile<String>(
                    title: const Text('አማርኛ + English (ሁለት ቋንቋ / Dual)', style: TextStyle(fontSize: 12)),
                    value: 'dual',
                    groupValue: _language,
                    onChanged: (val) => setState(() => _language = val!),
                  ),
                  RadioListTile<String>(
                    title: const Text('አማርኛ ብቻ (Amharic only)', style: TextStyle(fontSize: 12)),
                    value: 'am',
                    groupValue: _language,
                    onChanged: (val) => setState(() => _language = val!),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Sign Out Button
          OutlinedButton.icon(
            onPressed: widget.onLogout,
            icon: const Icon(Icons.logout, size: 18, color: Colors.red),
            label: const Text('ከመተግበሪያው ውጣ (Sign Out)', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.red, width: 1.2),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }
}
