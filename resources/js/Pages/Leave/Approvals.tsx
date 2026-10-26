import React from 'react';
import LeaveIndex from './Index';

export default function LeaveApprovals(props: any) {
    return (
        <LeaveIndex
            {...props}
            canApprove={true}
            allRequests={props.allRequests || props.leaveRequests || []}
            leaveRequests={props.leaveRequests || []}
            activeTab="approvals"
        />
    );
}
