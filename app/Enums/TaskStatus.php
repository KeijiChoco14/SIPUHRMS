<?php

namespace App\Enums;

enum TaskStatus: string
{
    case ToDo = 'To Do';
    case InProgress = 'In Progress';
    case Review = 'Review';
    case Done = 'Done';
    case Blocked = 'Blocked';
    case Cancelled = 'Cancelled';
}
