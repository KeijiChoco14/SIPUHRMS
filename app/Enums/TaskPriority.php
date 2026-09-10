<?php

namespace App\Enums;

enum TaskPriority: string
{
    case Low = 'Low';
    case Normal = 'Normal';
    case High = 'High';
    case Urgent = 'Urgent';
}
