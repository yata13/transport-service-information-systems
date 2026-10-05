import 'package:flutter/material.dart';
import '../widgets/app_top_bar.dart';
import '../widgets/app_drawer.dart';
import 'dashboard_screen.dart';
import 'verification_screen.dart';
import 'vehicles_list_screen.dart';
import 'reports_screen.dart';
import 'settings_screen.dart';
import 'login_screen.dart';

class AppShell extends StatefulWidget {
  final String officerName;
  final String badgeNumber;
  final String officerRole;

  const AppShell({
    super.key,
    required this.officerName,
    required this.badgeNumber,
    required this.officerRole,
  });

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String _currentScreen = 'verification';

  void _handleNavigate(String screen) {
    setState(() => _currentScreen = screen);
  }

  void _handleLogout() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget bodyContent;

    switch (_currentScreen) {
      case 'dashboard':
        bodyContent = DashboardScreen(onNavigate: _handleNavigate);
        break;
      case 'vehicles':
        bodyContent = VehiclesListScreen(onNavigate: _handleNavigate);
        break;
      case 'reports':
        bodyContent = const ReportsScreen();
        break;
      case 'settings':
        bodyContent = SettingsScreen(
          officerName: widget.officerName,
          badgeNumber: widget.badgeNumber,
          onLogout: _handleLogout,
        );
        break;
      case 'verification':
      default:
        bodyContent = VerificationScreen(onNavigate: _handleNavigate);
        break;
    }

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppTopBar(
        onToggleDrawer: () {
          if (_scaffoldKey.currentState?.isDrawerOpen ?? false) {
            _scaffoldKey.currentState?.closeDrawer();
          } else {
            _scaffoldKey.currentState?.openDrawer();
          }
        },
      ),
      drawer: AppDrawer(
        currentScreen: _currentScreen,
        onNavigate: _handleNavigate,
        onLogout: _handleLogout,
        officerName: widget.officerName,
        badgeNumber: widget.badgeNumber,
        officerRole: widget.officerRole,
      ),
      body: bodyContent,
    );
  }
}
