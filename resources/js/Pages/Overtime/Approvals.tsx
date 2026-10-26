import React from 'react';
import OvertimeIndex from './Index';

export default function OvertimeApprovals(props: any) {
    return (
        <OvertimeIndex
            {...props}
            canApprove={true}
            allRequests={props.allRequests || props.overtimeRequests || []}
            overtimeRequests={props.overtimeRequests || []}
            activeTab="approvals"
        />
    );
}
