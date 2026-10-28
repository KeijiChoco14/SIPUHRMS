<?php

namespace App\Enums;

enum TaskStatus: string
{
    case ToDo = 'To Do';
    case InProgress = 'In Progress';
    case Done = 'Done';
    case Approved = 'Approved';
    case Review = 'Review';
    case Blocked = 'Blocked';
    case Cancelled = 'Cancelled';
}
