import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Server,
  BarChart3,
  Lock,
  GitBranch,
  CreditCard,
  Database,
  Users,
  Activity,
  Share2,
  LayoutGrid,
  Radio,
  Globe,
  Terminal,
  Zap,
  Box,
  Layers
} from 'lucide-react';

interface SystemIconProps {
  name: string;
  className?: string;
}

export const SystemIcon: React.FC<SystemIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Server':
      return <Server className={className} />;
    case 'BarChart3':
      return <BarChart3 className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    case 'GitBranch':
      return <GitBranch className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Database':
      return <Database className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Share2':
      return <Share2 className={className} />;
    case 'LayoutGrid':
      return <LayoutGrid className={className} />;
    case 'Radio':
      return <Radio className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'Terminal':
      return <Terminal className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    default:
      return <Box className={className} />;
  }
};
