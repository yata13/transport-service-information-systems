import 'package:flutter/material.dart';
import '../models/bajaj_vehicle.dart';
import '../services/supabase_service.dart';
import 'validity_result_screen.dart';

class DashboardScreen extends StatefulWidget {
  final Function(String screen)? onNavigate;

  const DashboardScreen({super.key, this.onNavigate});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<BajajVehicle> _vehicles = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    final list = await SupabaseService.getAllVehicles();
    if (mounted) {
      setState(() => _vehicles = list);
    }
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                Icon(icon, color: color, size: 18),
              ],
            ),
            const SizedBox(height: 6),
            Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(fontSize: 9, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Hero Banner
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0C355B), Color(0xFF1E5B94)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.blue.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.verified_user, color: Colors.amber, size: 28),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'የጎንደር ከተማ ባጃጅ ትራፊክ ቁጥጥር',
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  'ማዕከላዊ የባጃጅ ፈቃድ ቁጥጥር እና የፍተሻ ሥርዓት',
                  style: TextStyle(color: Colors.white70, fontSize: 11),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () {
                    if (widget.onNavigate != null) {
                      widget.onNavigate!('verification');
                    }
                  },
                  icon: const Icon(Icons.qr_code_scanner, size: 18),
                  label: const Text('አዲስ ፍተሻ ጀምር (Start Verification)'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber.shade400,
                    foregroundColor: const Color(0xFF0C355B),
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2x2 Grid of Stats
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  title: 'የተመዘገቡ ባጃጆች',
                  value: '1,424',
                  subtitle: 'በጎንደር ከተማ መዝገብ',
                  icon: Icons.directions_car,
                  color: const Color(0xFF0C355B),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildStatCard(
                  title: 'ሕጋዊ ፈቃድ ያላቸው',
                  value: '1,280',
                  subtitle: '89.8% የፀደቁ',
                  icon: Icons.check_circle,
                  color: Colors.green.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  title: 'ጊዜው ያለፈበት',
                  value: '118',
                  subtitle: 'ማደስ የሚጠበቅባቸው',
                  icon: Icons.warning,
                  color: Colors.amber.shade800,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildStatCard(
                  title: 'የዛሬ ፍተሻዎች',
                  value: '284',
                  subtitle: 'በቼክፖይንት የተረጋገጡ',
                  icon: Icons.timeline,
                  color: Colors.blue.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Recent Inspections List
          const Text(
            'የቅርብ ጊዜ ፍተሻዎች (Recent Checkpoints):',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0C355B)),
          ),
          const SizedBox(height: 8),

          ..._vehicles.take(3).map((v) {
            final isActive = v.status == 'ACTIVE';
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: isActive ? Colors.green.shade100 : Colors.amber.shade100,
                  child: Icon(
                    isActive ? Icons.check : Icons.warning,
                    color: isActive ? Colors.green.shade800 : Colors.amber.shade900,
                    size: 18,
                  ),
                ),
                title: Text(v.plateNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                subtitle: Text('${v.driverName} · ${v.kebele}', style: const TextStyle(fontSize: 11)),
                trailing: const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ValidityResultScreen(vehicle: v),
                    ),
                  );
                },
              ),
            );
          }),
        ],
      ),
    );
  }
}
