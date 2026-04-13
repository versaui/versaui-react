'use client';

import React from 'react';

export const COUNTRY_FLAG_SIZES = ['small', 'medium', 'large'] as const;
export type CountryFlagSize = (typeof COUNTRY_FLAG_SIZES)[number];

// ISO 3166-1 alpha-2 country codes
export type CountryCode =
    | 'ac' | 'ad' | 'ae' | 'af' | 'ag' | 'ai' | 'al' | 'am' | 'ao' | 'aq' | 'ar' | 'as' | 'at' | 'au' | 'aw' | 'ax' | 'az'
    | 'ba' | 'bb' | 'bd' | 'be' | 'bf' | 'bg' | 'bh' | 'bi' | 'bj' | 'bl' | 'bm' | 'bn' | 'bo' | 'bq' | 'br' | 'bs' | 'bt' | 'bv' | 'bw' | 'by' | 'bz'
    | 'ca' | 'cc' | 'cd' | 'cf' | 'cg' | 'ch' | 'ci' | 'ck' | 'cl' | 'cm' | 'cn' | 'co' | 'cr' | 'cu' | 'cv' | 'cw' | 'cx' | 'cy' | 'cz'
    | 'de' | 'dj' | 'dk' | 'dm' | 'do' | 'dz'
    | 'ec' | 'ee' | 'eg' | 'eh' | 'er' | 'es' | 'et' | 'eu'
    | 'fi' | 'fj' | 'fk' | 'fm' | 'fo' | 'fr'
    | 'ga' | 'gb' | 'gd' | 'ge' | 'gf' | 'gg' | 'gh' | 'gi' | 'gl' | 'gm' | 'gn' | 'gp' | 'gq' | 'gr' | 'gs' | 'gt' | 'gu' | 'gw' | 'gy'
    | 'hk' | 'hm' | 'hn' | 'hr' | 'ht' | 'hu'
    | 'ic' | 'id' | 'ie' | 'il' | 'im' | 'in' | 'io' | 'iq' | 'ir' | 'is' | 'it'
    | 'je' | 'jm' | 'jo' | 'jp'
    | 'ke' | 'kg' | 'kh' | 'ki' | 'km' | 'kn' | 'kp' | 'kr' | 'kw' | 'ky' | 'kz'
    | 'la' | 'lb' | 'lc' | 'li' | 'lk' | 'lr' | 'ls' | 'lt' | 'lu' | 'lv' | 'ly'
    | 'ma' | 'mc' | 'md' | 'me' | 'mf' | 'mg' | 'mh' | 'mk' | 'ml' | 'mm' | 'mn' | 'mo' | 'mp' | 'mq' | 'mr' | 'ms' | 'mt' | 'mu' | 'mv' | 'mw' | 'mx' | 'my' | 'mz'
    | 'na' | 'nc' | 'ne' | 'nf' | 'ng' | 'ni' | 'nl' | 'no' | 'np' | 'nr' | 'nu' | 'nz'
    | 'om'
    | 'pa' | 'pe' | 'pf' | 'pg' | 'ph' | 'pk' | 'pl' | 'pm' | 'pn' | 'pr' | 'ps' | 'pt' | 'pw' | 'py'
    | 'qa'
    | 'ro' | 'rs' | 'ru' | 'rw'
    | 'sa' | 'sb' | 'sc' | 'sd' | 'se' | 'sg' | 'sh' | 'si' | 'sj' | 'sk' | 'sl' | 'sm' | 'sn' | 'so' | 'sr' | 'ss' | 'st' | 'sv' | 'sx' | 'sy' | 'sz'
    | 'ta' | 'tc' | 'td' | 'tf' | 'tg' | 'th' | 'tj' | 'tk' | 'tl' | 'tm' | 'tn' | 'to' | 'tr' | 'tt' | 'tv' | 'tw' | 'tz'
    | 'ua' | 'ug' | 'un' | 'us' | 'uy' | 'uz'
    | 'va' | 'vc' | 've' | 'vg' | 'vi' | 'vn' | 'vu'
    | 'wf' | 'ws'
    | 'xk'
    | 'ye' | 'yt'
    | 'za' | 'zm' | 'zw';

interface CountryFlagProps {
    /** ISO 3166-1 alpha-2 country code (lowercase) */
    country: CountryCode;
    /** Size of the flag: small (16px), medium (20px), large (24px) */
    size?: CountryFlagSize;
    /** Optional className for additional styling */
    className?: string;
}

const SIZE_MAP: Record<CountryFlagSize, number> = {
    small: 16,
    medium: 20,
    large: 24,
};

/**
 * CountryFlag Component
 * 
 * Displays a circular country flag based on ISO 3166-1 alpha-2 country code.
 * Flags are displayed in a 1:1 aspect ratio with circular clipping.
 */
export const CountryFlag: React.FC<CountryFlagProps> = ({
    country,
    size = 'large',
    className = '',
}) => {
    const pixelSize = SIZE_MAP[size];

    // Use flag-icons CDN for comprehensive flag coverage
    // These are SVG flags that display well at any size
    const flagUrl = `https://flagcdn.com/${country.toLowerCase()}.svg`;

    return (
        <div
            className={className}
            style={{
                width: pixelSize,
                height: pixelSize,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
            title={country.toUpperCase()}
        >
            <img
                src={flagUrl}
                alt={`${country.toUpperCase()} flag`}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                }}
                loading="lazy"
            />
        </div>
    );
};

CountryFlag.displayName = 'CountryFlag';

// Export common country codes for convenience
export const COMMON_COUNTRIES: CountryCode[] = [
    'us', 'gb', 'in', 'ae', 'ca', 'au', 'de', 'fr', 'jp', 'cn',
    'br', 'mx', 'it', 'es', 'nl', 'sg', 'hk', 'kr', 'ru', 'za',
];

// Country code to dial code mapping for phone inputs
export const COUNTRY_DIAL_CODES: Record<string, string> = {
    'ac': '+247',
    'ad': '+376',
    'ae': '+971',
    'af': '+93',
    'ag': '+1',
    'ai': '+1',
    'al': '+355',
    'am': '+374',
    'ao': '+244',
    'ar': '+54',
    'as': '+1',
    'at': '+43',
    'au': '+61',
    'aw': '+297',
    'ax': '+358',
    'az': '+994',
    'ba': '+387',
    'bb': '+1',
    'bd': '+880',
    'be': '+32',
    'bf': '+226',
    'bg': '+359',
    'bh': '+973',
    'bi': '+257',
    'bj': '+229',
    'bl': '+590',
    'bm': '+1',
    'bn': '+673',
    'bo': '+591',
    'bq': '+599',
    'br': '+55',
    'bs': '+1',
    'bt': '+975',
    'bw': '+267',
    'by': '+375',
    'bz': '+501',
    'ca': '+1',
    'cc': '+61',
    'cd': '+243',
    'cf': '+236',
    'cg': '+242',
    'ch': '+41',
    'ci': '+225',
    'ck': '+682',
    'cl': '+56',
    'cm': '+237',
    'cn': '+86',
    'co': '+57',
    'cr': '+506',
    'cu': '+53',
    'cv': '+238',
    'cw': '+599',
    'cx': '+61',
    'cy': '+357',
    'cz': '+420',
    'de': '+49',
    'dj': '+253',
    'dk': '+45',
    'dm': '+1',
    'do': '+1',
    'dz': '+213',
    'ec': '+593',
    'ee': '+372',
    'eg': '+20',
    'eh': '+212',
    'er': '+291',
    'es': '+34',
    'et': '+251',
    'fi': '+358',
    'fj': '+679',
    'fk': '+500',
    'fm': '+691',
    'fo': '+298',
    'fr': '+33',
    'ga': '+241',
    'gb': '+44',
    'gd': '+1',
    'ge': '+995',
    'gf': '+594',
    'gg': '+44',
    'gh': '+233',
    'gi': '+350',
    'gl': '+299',
    'gm': '+220',
    'gn': '+224',
    'gp': '+590',
    'gq': '+240',
    'gr': '+30',
    'gt': '+502',
    'gu': '+1',
    'gw': '+245',
    'gy': '+592',
    'hk': '+852',
    'hn': '+504',
    'hr': '+385',
    'ht': '+509',
    'hu': '+36',
    'id': '+62',
    'ie': '+353',
    'il': '+972',
    'im': '+44',
    'in': '+91',
    'io': '+246',
    'iq': '+964',
    'ir': '+98',
    'is': '+354',
    'it': '+39',
    'je': '+44',
    'jm': '+1',
    'jo': '+962',
    'jp': '+81',
    'ke': '+254',
    'kg': '+996',
    'kh': '+855',
    'ki': '+686',
    'km': '+269',
    'kn': '+1',
    'kp': '+850',
    'kr': '+82',
    'kw': '+965',
    'ky': '+1',
    'kz': '+7',
    'la': '+856',
    'lb': '+961',
    'lc': '+1',
    'li': '+423',
    'lk': '+94',
    'lr': '+231',
    'ls': '+266',
    'lt': '+370',
    'lu': '+352',
    'lv': '+371',
    'ly': '+218',
    'ma': '+212',
    'mc': '+377',
    'md': '+373',
    'me': '+382',
    'mf': '+590',
    'mg': '+261',
    'mh': '+692',
    'mk': '+389',
    'ml': '+223',
    'mm': '+95',
    'mn': '+976',
    'mo': '+853',
    'mp': '+1',
    'mq': '+596',
    'mr': '+222',
    'ms': '+1',
    'mt': '+356',
    'mu': '+230',
    'mv': '+960',
    'mw': '+265',
    'mx': '+52',
    'my': '+60',
    'mz': '+258',
    'na': '+264',
    'nc': '+687',
    'ne': '+227',
    'nf': '+672',
    'ng': '+234',
    'ni': '+505',
    'nl': '+31',
    'no': '+47',
    'np': '+977',
    'nr': '+674',
    'nu': '+683',
    'nz': '+64',
    'om': '+968',
    'pa': '+507',
    'pe': '+51',
    'pf': '+689',
    'pg': '+675',
    'ph': '+63',
    'pk': '+92',
    'pl': '+48',
    'pm': '+508',
    'pn': '+64',
    'pr': '+1',
    'ps': '+970',
    'pt': '+351',
    'pw': '+680',
    'py': '+595',
    'qa': '+974',
    'ro': '+40',
    'rs': '+381',
    'ru': '+7',
    'rw': '+250',
    'sa': '+966',
    'sb': '+677',
    'sc': '+248',
    'sd': '+249',
    'se': '+46',
    'sg': '+65',
    'sh': '+290',
    'si': '+386',
    'sj': '+47',
    'sk': '+421',
    'sl': '+232',
    'sm': '+378',
    'sn': '+221',
    'so': '+252',
    'sr': '+597',
    'ss': '+211',
    'st': '+239',
    'sv': '+503',
    'sx': '+1',
    'sy': '+963',
    'sz': '+268',
    'tc': '+1',
    'td': '+235',
    'tg': '+228',
    'th': '+66',
    'tj': '+992',
    'tk': '+690',
    'tl': '+670',
    'tm': '+993',
    'tn': '+216',
    'to': '+676',
    'tr': '+90',
    'tt': '+1',
    'tv': '+688',
    'tw': '+886',
    'tz': '+255',
    'ua': '+380',
    'ug': '+256',
    'us': '+1',
    'uy': '+598',
    'uz': '+998',
    'va': '+39',
    'vc': '+1',
    've': '+58',
    'vg': '+1',
    'vi': '+1',
    'vn': '+84',
    'vu': '+678',
    'wf': '+681',
    'ws': '+685',
    'xk': '+383',
    'ye': '+967',
    'yt': '+262',
    'za': '+27',
    'zm': '+260',
    'zw': '+263',
};

export default CountryFlag;
