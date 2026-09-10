<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Planning = 'Planning';
    case Active = 'Active';
    case OnHold = 'On Hold';
    case Completed = 'Completed';
    case Cancelled = 'Cancelled';
}
