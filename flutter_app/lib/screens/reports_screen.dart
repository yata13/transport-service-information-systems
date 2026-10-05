import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/violation_report.dart';
import '../services/supabase_service.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  List<TrafficViolationReport> _reports = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  void _loadReports() async {
    final list = await SupabaseService.getAllReports();
    if (mounted) {
      setState(() {
        _reports = list;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalFines = _reports.fold<double>(0, (sum, r) => sum + r.fineAmount);
    final impoundedCount = _reports.where((r) => r.status == 'IMPOUNDED').length;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0C355B)))
          : RefreshIndicator(
              onRefresh: () async => _loadReports(),
              color: const Color(0xFF0C355B),
              child: ListView(
                padding: const EdgeInsets.all(14.0),
                children: [
                  // Stat Cards
                  Row(
                    children: [
                      Expanded(
                        child: Card(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('የተመዘገቡ ቅጣቶች', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                const SizedBox(height: 4),
                                Text('${_reports.length}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                const Text('የጥሰት ሪፖርቶች', style: TextStyle(fontSize: 9, color: Colors.blue)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Card(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('የተጣለ የገንዘብ ቅጣት', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                const SizedBox(height: 4),
                                Text('${totalFines.toInt()} ብር', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red)),
                                Text('$impoundedCount የታገዱ', style: const TextStyle(fontSize: 9, color: Colors.redAccent)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  const Text(
                    'የቅርብ ጊዜ የትራፊክ ቅጣቶች (Recent Tickets):',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0C355B)),
                  ),
                  const SizedBox(height: 8),

                  ..._reports.map((r) {
                    final isImpounded = r.status == 'IMPOUNDED';

                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 1.5,
                      child: Padding(
                        padding: const EdgeInsets.all(14.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0C355B),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    r.vehiclePlate,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isImpounded ? Colors.red.shade50 : Colors.amber.shade50,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: isImpounded ? Colors.red.shade300 : Colors.amber.shade400),
                                  ),
                                  child: Text(
                                    r.status,
                                    style: TextStyle(
                                      color: isImpounded ? Colors.red.shade900 : Colors.amber.shade900,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 9,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              r.reasonAm,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              r.actionTaken,
                              style: TextStyle(fontSize: 11, color: isImpounded ? Colors.red : Colors.grey.shade700),
                            ),
                            const SizedBox(height: 8),
                            const Divider(height: 1),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${r.checkedBy} · ${r.location}',
                                  style: const TextStyle(fontSize: 9, color: Colors.grey),
                                ),
                                Text(
                                  '${r.fineAmount.toInt()} ብር',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.red),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }
}
