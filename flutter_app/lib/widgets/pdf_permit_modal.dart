import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../models/bajaj_vehicle.dart';

class PdfPermitModal extends StatelessWidget {
  final BajajVehicle vehicle;

  const PdfPermitModal({super.key, required this.vehicle});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 420),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.fileText, color: Color(0xFF0C355B), size: 20),
                      SizedBox(width: 8),
                      Text(
                        'የዲጂታል ፈቃድ ሰነድ (PDF)',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const Divider(),
              const SizedBox(height: 8),

              // Visual Official Certificate Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFCFDFE),
                  border: Border.all(color: const Color(0xFF0C355B), width: 2),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.blue.withOpacity(0.08),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Official Seal & Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: const Color(0xFF0C355B),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(LucideIcons.shield, color: Colors.amber, size: 18),
                        ),
                        const SizedBox(width: 10),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'የጎንደር ከተማ አስተዳደር ትራንስፖርት መምሪያ',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0C355B)),
                            ),
                            Text(
                              'Gondar City Transport Regulatory Department',
                              style: TextStyle(fontSize: 8, color: Colors.grey),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0C355B),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'ይፋዊ የባጃጅ ትራንስፖርት አገልግሎት ፈቃድ (OFFICIAL PERMIT)',
                        style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // QR and Essential Credentials
                    Row(
                      children: [
                        QrImageView(
                          data: vehicle.qrCodeValue.isNotEmpty ? vehicle.qrCodeValue : vehicle.digitalId,
                          version: QrVersions.auto,
                          size: 80.0,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'ሰሌዳ: ${vehicle.plateNumber}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0C355B)),
                              ),
                              Text('ፈቃድ ቁጥር: ${vehicle.permitNo}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
                              Text('ባለቤት: ${vehicle.owner}', style: const TextStyle(fontSize: 10)),
                              Text('አሽከርካሪ: ${vehicle.driverName}', style: const TextStyle(fontSize: 10)),
                              Text('ዞን: ${vehicle.authorizedArea}', style: const TextStyle(fontSize: 9, color: Colors.indigo)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1),
                    const SizedBox(height: 8),

                    // Dates and Verification Stamp
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('የተሰጠበት ቀን (Issued):', style: TextStyle(fontSize: 8, color: Colors.grey)),
                            Text(vehicle.issueDate, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text('የሚያበቃበት ቀን (Expires):', style: TextStyle(fontSize: 8, color: Colors.grey)),
                            Text(
                              vehicle.expiryDate,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: vehicle.status == 'ACTIVE' ? Colors.green.shade800 : Colors.red,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(LucideIcons.x, size: 16),
                      label: const Text('ዝጋ (Close)'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('ፈቃድ በተሳካ ሁኔታ ተልኳል / ወርዷል (Permit Exported)'),
                            backgroundColor: Color(0xFF0C355B),
                          ),
                        );
                        Navigator.pop(context);
                      },
                      icon: const Icon(LucideIcons.printer, size: 16),
                      label: const Text('አትም (Print/Save)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0C355B),
                        foregroundColor: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
