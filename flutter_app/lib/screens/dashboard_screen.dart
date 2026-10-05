import 'package:flutter/material.dart';
import '../models/bajaj_vehicle.dart';
import '../models/violation_report.dart';
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
  List<TrafficViolationReport> _reports = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    final vehicles = await SupabaseService.getAllVehicles();
    final reports = await SupabaseService.getAllReports();

    if (mounted) {
      setState(() {
        _vehicles = vehicles;
        _reports = reports;
        _isLoading = false;
      });
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
                Flexible(
                  child: Text(
                    title,
                    style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w600),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(icon, color: color, size: 20),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 10, color: Colors.grey),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // 100% Real, computed dynamic data from Database
    final totalVehicles = _vehicles.length;
    final validVehicles = _vehicles.where((v) => v.status == 'ACTIVE').length;
    final expiredVehicles = _vehicles.where((v) => v.status == 'EXPIRED').length;
    final suspendedVehicles = _vehicles.where((v) => v.status == 'SUSPENDED' || v.isBlacklisted).length;
    final validPercentage = totalVehicles > 0 ? ((validVehicles / totalVehicles) * 100).toStringAsFixed(1) : '0.0';
    final totalFines = _reports.fold<double>(0, (sum, r) => sum + r.fineAmount);
    final isOnline = SupabaseService.isConnected;

    return RefreshIndicator(
      onRefresh: _loadData,
      color: const Color(0xFF0C355B),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero Banner with live Database connection status
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
                  Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.amber.shade400, width: 1.5),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.asset(
                            'assets/images/app_logo.png',
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Icon(Icons.verified_user, color: Colors.amber, size: 24),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'የጎንደር ከተማ ባጃጅ ትራፊክ ቁጥጥር',
                              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'ቀጥታ የቀጥታ ስርጭት መረጃ (Real-time Database)',
                              style: TextStyle(color: Colors.white70, fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: _loadData,
                        icon: const Icon(Icons.refresh, color: Colors.white70, size: 20),
                        tooltip: 'መረጃ አድስ (Refresh Data)',
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Real-time Cloud Connection Tag
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isOnline ? Colors.green.shade900.withOpacity(0.4) : Colors.amber.shade900.withOpacity(0.4),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isOnline ? Colors.greenAccent : Colors.amberAccent, width: 0.8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isOnline ? Icons.cloud_done : Icons.storage,
                          size: 13,
                          color: isOnline ? Colors.greenAccent : Colors.amberAccent,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          isOnline
                              ? 'ከSupabase ደመና ጋር ተገናኝቷል ($totalVehicles ባጃጆች በመዝገብ)'
                              : 'ከአካባቢያዊ ዳታቤዝ ጋር እየሰራ ነው ($totalVehicles ባጃጆች)',
                          style: TextStyle(
                            color: isOnline ? Colors.greenAccent : Colors.amberAccent,
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
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
                      minimumSize: const Size.fromHeight(42),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Live Computed 2x2 Grid of Stats
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    title: 'የተመዘገቡ ባጃጆች',
                    value: '$totalVehicles',
                    subtitle: 'በጎንደር ከተማ መዝገብ ውስጥ',
                    icon: Icons.directions_car,
                    color: const Color(0xFF0C355B),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildStatCard(
                    title: 'ሕጋዊ ፈቃድ ያላቸው',
                    value: '$validVehicles',
                    subtitle: '$validPercentage% የፀደቁ (Valid)',
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
                    value: '$expiredVehicles',
                    subtitle: 'ማደስ የሚጠበቅባቸው',
                    icon: Icons.warning,
                    color: Colors.amber.shade800,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildStatCard(
                    title: 'የታገዱ / ቅጣት',
                    value: '$suspendedVehicles / ${_reports.length}',
                    subtitle: '${totalFines.toInt()} ብር የተጣለ ቅጣት',
                    icon: Icons.report_problem,
                    color: Colors.red.shade700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Real Verified Vehicles List from Database
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'የተመዘገቡ ባጃጆች መረጃ (Registered Fleet):',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0C355B)),
                ),
                TextButton(
                  onPressed: () {
                    if (widget.onNavigate != null) {
                      widget.onNavigate!('vehicles');
                    }
                  },
                  child: const Text('ሁሉንም እይ (View All)', style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 4),

            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: CircularProgressIndicator(color: Color(0xFF0C355B)),
                ),
              )
            else if (_vehicles.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: Text('ምንም ተሽከርካሪ አልተገኘም (No Vehicles Found)', style: TextStyle(color: Colors.grey)),
                ),
              )
            else
              ..._vehicles.map((v) {
                final isValid = v.status == 'ACTIVE';
                final isExpired = v.status == 'EXPIRED';

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 1,
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    leading: CircleAvatar(
                      backgroundColor: isValid
                          ? Colors.green.shade100
                          : isExpired
                              ? Colors.amber.shade100
                              : Colors.red.shade100,
                      child: Icon(
                        isValid
                            ? Icons.check
                            : isExpired
                                ? Icons.warning
                                : Icons.cancel,
                        color: isValid
                            ? Colors.green.shade800
                            : isExpired
                                ? Colors.amber.shade900
                                : Colors.red.shade900,
                        size: 20,
                      ),
                    ),
                    title: Row(
                      children: [
                        Text(
                          v.plateNumber,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isValid
                                ? Colors.green.shade50
                                : isExpired
                                    ? Colors.amber.shade50
                                    : Colors.red.shade50,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            v.status,
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: isValid
                                  ? Colors.green.shade800
                                  : isExpired
                                      ? Colors.amber.shade900
                                      : Colors.red.shade900,
                            ),
                          ),
                        ),
                      ],
                    ),
                    subtitle: Text(
                      '${v.driverName} · ${v.kebele} · ${v.digitalId}',
                      style: const TextStyle(fontSize: 10, color: Colors.black87),
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ValidityResultScreen(
                            vehicle: v,
                            onNavigate: widget.onNavigate,
                          ),
                        ),
                      );
                    },
                  ),
                );
              }),

            const SizedBox(height: 16),

            // Real Violation Reports Section from Database
            if (_reports.isNotEmpty) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'የቅርብ ጊዜ የጥሰት ቅጣቶች (Recent Tickets):',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0C355B)),
                  ),
                  TextButton(
                    onPressed: () {
                      if (widget.onNavigate != null) {
                        widget.onNavigate!('reports');
                      }
                    },
                    child: const Text('ሁሉንም እይ (View All)', style: TextStyle(fontSize: 11)),
                  ),
                ],
              ),
              const SizedBox(height: 4),

              ..._reports.take(3).map((r) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    dense: true,
                    leading: const Icon(Icons.receipt_long, color: Colors.red, size: 22),
                    title: Text('${r.vehiclePlate} — ${r.reasonAm}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                    subtitle: Text('${r.checkedBy} · ${r.location}', style: const TextStyle(fontSize: 9, color: Colors.grey)),
                    trailing: Text(
                      '${r.fineAmount.toInt()} ብር',
                      style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}
