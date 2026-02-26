<?php

namespace App\Enums;

enum CollectionType: string
{
    case HAVANA = 'havana-collection';
    case MOCHA = 'mocha-mousse-25';
    case GROOM = 'groom-collection';
    case OFFICE = 'office-collections';
    case ACCESSORIES = 'accessories';
    case TRAVEL = 'travel-collection';
    case SHADES = 'shades-of-elegance';
    case STREET = 'street-sartorial';

    public function getStoragePath(): string
    {
        return match ($this) {
            self::ACCESSORIES => '/uploads/collections/accessories/',
            self::TRAVEL => '/uploads/collections/Travel collections/',
            self::SHADES => '/uploads/shades1/',
            self::STREET => '/uploads/street1/',
            default => '/uploads/collections/default/',
        };
    }

    public function getPreferredExtension(): string
    {
        return match ($this) {
            self::HAVANA, self::MOCHA, self::OFFICE => 'jpg',
            default => 'webp',
        };
    }
}
