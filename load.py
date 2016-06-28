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
for code in range(0x10FFFF):
    info = charInfo(code)
    if info:
        data.append(info)

print json.dumps(data)
