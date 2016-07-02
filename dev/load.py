import unicodedata, sys, threading

# from http://www.interclasse.com/scripts/spin.php, by Branimir Petrovic.
class ProgressBase(threading.Thread):
    """Base class - not to be instantiated."""

    def __init__(self):
        self.rlock = threading.RLock()
        self.cv = threading.Condition()
        threading.Thread.__init__(self)
        self.setDaemon(1)

    def __backStep(self):
        if self.inplace: sys.stdout.write('\b \b')

    def __call__(self):
        self.start()

    def start(self):
        self.stopFlag = 0
        threading.Thread.start(self)

    def stop(self):
        """To be called by the 'main' thread: Method will block
        and wait for the thread to stop before returning control
        to 'main'."""

        self.stopFlag = 1

        # Wake up 'Sleeping Beauty' ahead of time (if it needs to)...
        self.cv.acquire()
        self.cv.notify()
        self.cv.release()

        # Block and wait here untill thread fully exits its run method.
        self.rlock.acquire()

class Spinner(ProgressBase):
    """Print 'animated' /|\ sequence to stdout in separate thread"""

    def __init__(self, speed=0.1):
        self.__seq = r'\|/-'
        self.__speed = speed
        self.inplace = 1
        ProgressBase.__init__(self)

    def run(self):
        self.rlock.acquire()
        self.cv.acquire()
        sys.stdout.write(' ')
        while 1:
            for char in self.__seq:
                self.cv.wait(self.__speed)  # 'Sleeping Beauty' part
                if self.stopFlag:
                    self._ProgressBase__backStep()
                    try :
                        return                          ### >>>
                    finally :
                        # release lock immediatley after returning
                        self.rlock.release()
                if self.inplace: sys.stdout.write('\b')
                sys.stdout.write(char)
                sys.stdout.flush()


class Bar(ProgressBase):
    '''Modified from spinner'''

    def __init__(self, speed=0.025, length=50):
        self.__speed = speed
        self.__length = length
        self.inplace = 1
        ProgressBase.__init__(self)

    def run(self):
        '''
        Displays:
        `.`*length
        then, add one • each frame until full
        then, add one . from the start each frame until full
        '''
        self.rlock.acquire()
        self.cv.acquire()
        sys.stdout.write(' ')
        chars = '#-'
        insertIdx = 0
        string = list(chars[1] * (self.__length))
        clearLen = self.__length + 12

        while 1:
            for i in range(self.__length):
                self.cv.wait(self.__speed)  # 'Sleeping Beauty' part
                string[i] = chars[insertIdx]
                if self.stopFlag:
                    sys.stdout.write('\b' * clearLen + ' ' * clearLen + '\b' * clearLen)
                    try :
                        return                          ### >>>
                    finally :
                        # release lock immediately after returning
                        self.rlock.release()
                if self.inplace: sys.stdout.write('\b' * clearLen)
                sys.stdout.write('Writing…: [' + ''.join(string) + ']')
                sys.stdout.flush()
            insertIdx += 1
            while insertIdx >= len(chars):
                insertIdx -= len(chars)

# end from

verbose = False
if len(sys.argv) >= 2 and sys.argv[1] == "-v":
    verbose = True

def printProgress (iteration, total, prefix = '', suffix = '', decimals = 2, barLength = 100):
    """
    FROM http://stackoverflow.com/a/34325723/5244995

    Call in a loop to create terminal progress bar
    @params:
        iteration   - Required  : current iteration (Int)
        total       - Required  : total iterations (Int)
        prefix      - Optional  : prefix string (Str)
        suffix      - Optional  : suffix string (Str)
        decimals    - Optional  : number of decimals in percent complete (Int)
        barLength   - Optional  : character length of bar (Int)
    """
    filledLength    = int(round(barLength * iteration / float(total)))
    percents        = round(100.00 * (iteration / float(total)), decimals)
    bar             = '#' * filledLength + '-' * (barLength - filledLength)
    sys.stdout.write('%s [%s] %s%s %s\r' % (prefix, bar, percents, '%', suffix)),
    sys.stdout.flush()
    if iteration == total:
        print("\n")



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

def isBadCode(code):
    return (
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
            0x1EE00 <= code <= 0x1EEFf)   # Arabic Math Symbols

EXCLUDE = [None, "REPLACEMENT CHARACTER"]

data = []
if verbose:
    print('Generating Data...')
for code in range(0xE0000):
    if isBadCode(code): continue
    info = charInfo(code)
    if info:
        data.append(info)
    if verbose and code % 100 == 0:
        printProgress(code, 0xE0000, prefix = 'Progress:', suffix = 'Complete', barLength = 50)

import zlib
try:
    import cbor2
except ImportError:
    print('Oh, no! Did you run `pip install cbor2`?')
    cbor2 = None

if verbose:
    print('\nConverting to CBOR...', end=' ')
    indicator = Spinner()
    indicator.start()

cborData = cbor2.dumps(data)

if verbose:
    indicator.stop()
    print('Done.\nCompressing...', end=' ')

    indicator = Spinner()
    indicator.start()

compressed = zlib.compress(cborData)

if verbose:
    indicator.stop()
    print('Done.\nWriting...', end=' ')

    indicator = Spinner()
    indicator.start()

with open('../data.dat', 'wb') as f:
    f.write(compressed)

if verbose:
    indicator.stop()
    print('Done.')
    indicator = None
