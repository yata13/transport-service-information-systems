import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/bajaj_vehicle.dart';
import '../models/violation_report.dart';
import '../services/supabase_service.dart';

class ViolationReportScreen extends StatefulWidget {
  final BajajVehicle vehicle;

  const ViolationReportScreen({super.key, required this.vehicle});

  @override
  State<ViolationReportScreen> createState() => _ViolationReportScreenState();
}

class _ViolationReportScreenState extends State<ViolationReportScreen> {
  final _locationController = TextEditingController(text: 'ጎንደር ፒያሳ አደባባይ (Piassa Square)');
  final _notesController = TextEditingController();
  double _fineAmount = 1000;
  bool _impoundVehicle = false;
  bool _isSubmitting = false;

  final List<Map<String, String>> _violationTypes = [
    {
      'reasonAm': 'የአመቱ የስራ ፈቃድ ጊዜው ያለፈበት (Expired Annual Permit)',
      'reasonEn': 'Operating with expired transport permit',
      'fine': '1000',
    },
    {
      'reasonAm': 'ያልተፈቀደ የጉዞ ዞን ጥሰት (Route / Zone Violation)',
      'reasonEn': 'Operating outside authorized zone/route',
      'fine': '1500',
    },
    {
      'reasonAm': 'የትርፍ ሰው ጭነት ማጓጓዝ (Overloading Passengers)',
      'reasonEn': 'Carrying excess passengers beyond capacity',
      'fine': '1000',
    },
    {
      'reasonAm': 'የሰሌዳ ቁጥር አለመዛመድ / ማጭበርበር (Plate Mismatch / Fraud)',
      'reasonEn': 'Plate does not match registered vehicle chassis',
      'fine': '2000',
    },
    {
      'reasonAm': 'የታሪፍ ጭማሪ ማድረግ (Illegal Tariff Overcharge)',
      'reasonEn': 'Charging passengers above the legal rate',
      'fine': '500',
    },
  ];

  late String _selectedReasonAm;
  late String _selectedReasonEn;

  @override
  void initState() {
    super.initState();
    _selectedReasonAm = _violationTypes.first['reasonAm']!;
    _selectedReasonEn = _violationTypes.first['reasonEn']!;
  }

  void _handleSubmit() async {
    setState(() => _isSubmitting = true);

    final report = TrafficViolationReport(
      id: 'rep-${DateTime.now().millisecondsSinceEpoch}',
      reportNumber: 'RPT-GD-${DateTime.now().year}-${DateTime.now().millisecond}',
      digitalId: widget.vehicle.digitalId,
      vehiclePlate: widget.vehicle.plateNumber,
      registeredPlate: widget.vehicle.plateNumber,
      reason: _selectedReasonEn,
      reasonAm: _selectedReasonAm,
      actionTaken: _impoundVehicle
          ? 'ባጃጅ ወደ ጎንደር ትራፊክ መምሪያ እንዲቆም ተደርጓል (Impounded)'
          : 'የትራፊክ ቅጣት ${_fineAmount.toInt()} ብር ተጥሏል (Traffic Ticket)',
      fineAmount: _fineAmount,
      checkedOn: DateTime.now().toString().split('.')[0],
      checkedBy: 'ኢንስፔክተር አበበ ተሰማ',
      notes: _notesController.text.isNotEmpty ? _notesController.text : 'መደበኛ ፍተሻ',
      status: _impoundVehicle ? 'IMPOUNDED' : 'SUBMITTED',
      location: _locationController.text,
    );

    await SupabaseService.submitViolationReport(report);

    setState(() => _isSubmitting = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('የጥሰት ሪፖርት #${report.reportNumber} በተሳካ ሁኔታ ተመዝግቧል!'),
          backgroundColor: const Color(0xFF0C355B),
          duration: const Duration(seconds: 3),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        title: const Text('የጥሰት ሪፖርት መመዝገቢያ (Traffic Ticket)'),
        backgroundColor: Colors.red.shade800,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Vehicle Header
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.alertTriangle, color: Colors.red, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ሰሌዳ: ${widget.vehicle.plateNumber}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.red),
                        ),
                        Text(
                          'አሽከርካሪ: ${widget.vehicle.driverName} · ${widget.vehicle.digitalId}',
                          style: const TextStyle(fontSize: 10, color: Colors.black87),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Form Card
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'የጥሰት አይነት ይምረጡ (Violation Reason)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 10),

                    // Violation Selector Dropdown
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedReasonAm,
                          isExpanded: true,
                          items: _violationTypes.map((v) {
                            return DropdownMenuItem<String>(
                              value: v['reasonAm'],
                              child: Text(
                                v['reasonAm']!,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setState(() {
                                _selectedReasonAm = val;
                                final match = _violationTypes.firstWhere((x) => x['reasonAm'] == val);
                                _selectedReasonEn = match['reasonEn']!;
                                _fineAmount = double.parse(match['fine']!);
                              });
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Fine Amount
                    const Text(
                      'የቅጣት መጠን (Fine Amount - ETB)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [500, 1000, 1500, 2000].map((amount) {
                        final isSel = _fineAmount == amount.toDouble();
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 3),
                            child: ChoiceChip(
                              label: Text('$amount ብር', style: const TextStyle(fontSize: 11)),
                              selected: isSel,
                              selectedColor: const Color(0xFF0C355B),
                              labelStyle: TextStyle(
                                color: isSel ? Colors.white : Colors.black87,
                                fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                              ),
                              onSelected: (_) {
                                setState(() => _fineAmount = amount.toDouble());
                              },
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    // Location Input
                    const Text(
                      'የተፈጸመበት ቦታ (Location)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _locationController,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(LucideIcons.mapPin, size: 18),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Impound Checkbox
                    CheckboxListTile(
                      value: _impoundVehicle,
                      onChanged: (val) => setState(() => _impoundVehicle = val ?? false),
                      title: const Text(
                        'ተሽከርካሪው ይታገድ / ወደ መምሪያው ይግባ (Impound)',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.red),
                      ),
                      subtitle: const Text('አስጊ ወይም ሐሰተኛ ሰሌዳ ላላቸው ባጃጆች', style: TextStyle(fontSize: 10)),
                      contentPadding: EdgeInsets.zero,
                      controlAffinity: ListTileControlAffinity.leading,
                    ),
                    const SizedBox(height: 12),

                    // Officer Notes
                    const Text(
                      'የመኮንኑ ማስታወሻ (Officer Notes)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _notesController,
                      maxLines: 2,
                      decoration: InputDecoration(
                        hintText: 'ምሳሌ፡ ሰነድ አልያዘም ወይም ትርፍ ሰው ጭኖ ተይዟል...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Submit Button
            ElevatedButton.icon(
              onPressed: _isSubmitting ? null : _handleSubmit,
              icon: const Icon(LucideIcons.send, size: 18),
              label: _isSubmitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('ሪፖርት አስገባ እና ፍቃድ አግድ (Submit Ticket)', style: TextStyle(fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade800,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
