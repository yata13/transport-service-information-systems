import 'package:flutter/material.dart';

class AppDrawer extends StatelessWidget {
  final String currentScreen;
  final Function(String screen) onNavigate;
  final VoidCallback onLogout;
  final String officerName;
  final String badgeNumber;
  final String officerRole;

  const AppDrawer({
    super.key,
    required this.currentScreen,
    required this.onNavigate,
    required this.onLogout,
    required this.officerName,
    required this.badgeNumber,
    required this.officerRole,
  });

  Widget _buildMenuItem({
    required BuildContext context,
    required String id,
    required String labelAm,
    required String labelEn,
    required IconData icon,
  }) {
    final isSelected = currentScreen == id || (id == 'story' && currentScreen == 'reports');

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      child: Material(
        color: isSelected ? const Color(0xFF1E5B94) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          onTap: () {
            Navigator.pop(context); // close drawer
            onNavigate(id);
          },
          borderRadius: BorderRadius.circular(10),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 20,
                  color: isSelected ? Colors.amber.shade400 : Colors.blue.shade100,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        labelAm,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        labelEn,
                        style: TextStyle(
                          fontSize: 10,
                          color: isSelected ? Colors.white70 : Colors.blue.shade200,
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

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFF0C355B),
      child: SafeArea(
        child: Column(
          children: [
            // Header with Emblem
            Container(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0xFF164472), width: 1)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF1E5B94), Color(0xFF0C355B)],
                          ),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.amber.shade400, width: 1.5),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Image.asset(
                            'assets/images/app_logo.png',
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Icon(Icons.verified_user, color: Colors.amber, size: 26),
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'የትራንስፖርት ዕቅድ እና ማረጋገጫ ሥርዓት',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'የጎንደር ከተማ አስተዳደር · የመስክ መተግበሪያ',
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.blue.shade200,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Officer Card
            Container(
              margin: const EdgeInsets.all(12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF07213A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF164472)),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: const Color(0xFF185A9D),
                    child: Text(
                      officerName.isNotEmpty ? officerName[0] : 'ኢ',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          officerName,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          badgeNumber,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: Colors.amber.shade400,
                          ),
                        ),
                        Text(
                          officerRole,
                          style: const TextStyle(
                            fontSize: 9,
                            color: Colors.white60,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Navigation Items: Verification, Story, Settings
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _buildMenuItem(
                    context: context,
                    id: 'verification',
                    labelAm: 'የባጃጅ ፍተሻ',
                    labelEn: 'Verification & Roadside Scan',
                    icon: Icons.qr_code_scanner,
                  ),
                  _buildMenuItem(
                    context: context,
                    id: 'story',
                    labelAm: 'የፍተሻ ታሪክ / ጥሰቶች',
                    labelEn: 'Inspection Story & Citations',
                    icon: Icons.history,
                  ),
                  _buildMenuItem(
                    context: context,
                    id: 'settings',
                    labelAm: 'ቅንብሮች',
                    labelEn: 'Settings & Cloud Sync',
                    icon: Icons.settings,
                  ),
                ],
              ),
            ),

            // Logout Button
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  onLogout();
                },
                icon: const Icon(Icons.logout, size: 18, color: Colors.redAccent),
                label: const Text(
                  'ውጣ (Sign Out)',
                  style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.redAccent, width: 1.2),
                  minimumSize: const Size.fromHeight(44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
