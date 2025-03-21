// src/components/profile/KYCStatusCard.tsx

import React from 'react';
import { KYCStatus } from '../../types/contracts';
import Button from '../common/Button';

interface KYCStatusCardProps {
  kycStatus: KYCStatus;
  trustScore: number;
  onSubmitKYC: () => void;
  isSubmitting: boolean;
}

const KYCStatusCard: React.FC<KYCStatusCardProps> = ({
  kycStatus,
  trustScore,
  onSubmitKYC,
  isSubmitting
}) => {
  const getStatusInfo = () => {
    switch (kycStatus) {
      case KYCStatus.NotSubmitted:
        return {
          title: 'KYC Not Submitted',
          description: 'Complete KYC verification to increase your trust score and access more features.',
          color: 'border-gray-300',
          bgColor: 'bg-gray-50',
          actionButton: (
            <Button
              onClick={onSubmitKYC}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              variant="primary"
              size="sm"
            >
              Submit KYC
            </Button>
          )
        };
      case KYCStatus.Pending:
        return {
          title: 'KYC Pending',
          description: 'Your KYC verification is currently under review. This process typically takes 1-3 business days.',
          color: 'border-yellow-400',
          bgColor: 'bg-yellow-50',
          actionButton: null
        };
      case KYCStatus.Approved:
        return {
          title: 'KYC Approved',
          description: 'Your identity has been verified. You now have full access to all platform features.',
          color: 'border-green-500',
          bgColor: 'bg-green-50',
          actionButton: null
        };
      case KYCStatus.Rejected:
        return {
          title: 'KYC Rejected',
          description: 'Your KYC verification was rejected. Please contact support for more information.',
          color: 'border-red-500',
          bgColor: 'bg-red-50',
          actionButton: (
            <Button
              onClick={onSubmitKYC}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              variant="primary"
              size="sm"
            >
              Resubmit KYC
            </Button>
          )
        };
      default:
        return {
          title: 'KYC Status',
          description: 'Unknown status',
          color: 'border-gray-300',
          bgColor: 'bg-gray-50',
          actionButton: null
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`border ${statusInfo.color} rounded-lg shadow-sm ${statusInfo.bgColor} p-4`}>
      <h3 className="text-lg font-semibold mb-2">{statusInfo.title}</h3>
      <p className="text-gray-700 mb-3">{statusInfo.description}</p>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Trust Score</span>
          <span className="text-sm font-medium">{trustScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${trustScore}%` }}
          ></div>
        </div>
      </div>
      
      {statusInfo.actionButton}
    </div>
  );
};

export default KYCStatusCard;