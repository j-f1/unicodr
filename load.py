import unicodedata, json, sys
def fromCode(code):
    if sys.version[0] == '2':
        return unichr(code)
    else:
        return chr(code)

def charInfo(code):
    char = fromCode(code)
    name = unicodedata.name(char, None)
    if name in EXCLUDE: return False
    return {'name': name, 'code': code}

EXCLUDE = [None, "REPLACEMENT CHARACTER"]

data = []
for code in range(0x1F773):
    if (
        0x00700 <= code <= 0x00740 or # Syriac
        0x00780 <= code <= 0x008FF or # Thaana, N’Ko, Samaritan, Mandaic, Arabic Ext-A
        0x00EDE <= code <= 0x00EFF or # some Lao
        0x00FD0 <= code <= 0x00FFF or # some Tibetan
        0x0105A <= code <= 0x0109f or # some Myanmar
        0x01700 <= code <= 0x0177f or # Tagalog, Hanunoo, Buhid, Tagbanwa
        0x018AA <= code <= 0x019Df or # some Mongolian, Unified Canadian Aboriginal Syll. Ext., Limbu, Tai Le, New Tai Lue
        0x01A00 <= code <= 0x01CFf or # Buginese, Tai Tham, Balinese, Batak, Sudanese, Lepcha, Ol Chiki, Sudanese Sup, Vedic Ext.
        0x02B56 <= code <= 0x02C5f or # Some Misc. Symbols/ Arrows, Glagolitic
        0x02C80 <= code <= 0x02D7f or # Coptic, Georgian Sup, Tifinagh
        0x02E31 <= code <= 0x02E7f or # Some Sup Punctuation
        0x031D0 <= code <= 0x031Ef or # some CJK Strokes
        0x0A500 <= code <= 0x0A63f or # Vai
        0x0A6A0 <= code <= 0x0A6Ff or # Bamum
        0x0D7B0 <= code <= 0x0F8Ff or # Hangul Jamo Extended-B, Surragates, Private Use, excluding ``.
        0x0FA6E <= code <= 0x0FAFf or # Some CJK Compatibility Ideographs
        0x10000 <= code <= 0x100Ff or # Linear B Syllabary, Linear B Ideograms
        0x1019C <= code <= 0x101Ff or # Ancient Symbols (REALLY????), Phaistos Disc
        0x10330 <= code <= 0x103Df or # Gothic, Ugaritic, Old Persian
        0x10480 <= code <= 0x1D0Ff or # Osmanya, Cypriot Syllabary, Imperial Aramaic, Phoenician, Lydian, Meroitic Cursive/Hiero, Kharoshthi, Old South Arabian, Avestan, Parthian, Pahlavi, Old Turkic, Rumi #’s, Brahmi, Kaithi, Sora Sompeng, Chakma, Sharada, Takri, Cuneiform, Egyptian Hiero, Bamum Sup, Miao, Kana Sup, Byzantine Music
        0x1D1CF <= code <= 0x1D24f or # Regular & Ancient Greek Music
        0x1EE00 <= code <= 0x1EEFf or # Arabic Math Symbols
        False):
        continue
    info = charInfo(code)
    if info:
        data.append(info)

print json.dumps(data)
