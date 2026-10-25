/**
 * Part IV — Applications (chapters 22–29)
 */

export const part4 = [
  {
    number: 22,
    title: 'Audio Processing',
    part: 'Applications',
    tagline: 'DSP for the ear: hearing, timbre, compression, speech, and deliberate distortion.',
    intro: `Audio is the most accessible DSP laboratory: you can hear the result immediately. But human hearing is not a laboratory instrument. It is nonlinear, logarithmic, masked by simultaneous sounds, and highly sensitive to some distortions while tolerant of others. Good audio DSP models the listener, not just the waveform.

This chapter covers the auditory system, timbre, the relationship between sound quality and data rate, high-fidelity design, companding, speech synthesis and recognition, and nonlinear audio effects. It shows how psychoacoustics shapes compression and why “better” is not always “more bits.”`,
    objectives: [
      'Describe the range, sensitivity, and masking behavior of human hearing.',
      'Explain timbre and the source-filter model of speech.',
      'Relate sampling rate, bit depth, and compression to audio quality.',
      'Explain companding and perceptual coding.',
      'Distinguish useful nonlinear audio processing from unwanted distortion.',
    ],
    prerequisites: [3, 8, 14],
    sections: [
      {
        id: '22.1', title: 'Human Hearing', page: 351, level: 'core',
        intuition: `We hear over roughly 20 Hz to 20 kHz, but not equally: sensitivity peaks in the speech band, loudness is logarithmic, and quiet sounds are masked by louder neighbors.`,
        detail: `Human hearing spans about 20 Hz–20 kHz in youth, narrowing with age. Loudness perception is roughly logarithmic, which is why decibels are natural. The ear is most sensitive around 2–5 kHz, where the ear canal resonates; equal-loudness contours show that a 50 Hz tone must be much louder than a 3 kHz tone to sound equally loud. Masking occurs when a strong tone raises the threshold for nearby frequencies, both simultaneously and after the sound (temporal masking). Critical bands describe the frequency resolution of the cochlea. These effects let perceptual coders discard components that will be inaudible, and they explain why distortion at low levels may be inaudible while the same distortion at high levels is obvious.`,
        keyPoints: [
          'Hearing range ≈20 Hz–20 kHz; sensitivity is nonuniform.',
          'Loudness is approximately logarithmic; dB matches perception.',
          'Masking and critical bands allow perceptual compression.',
        ],
        application: `MP3/AAC coding, hearing-aid fitting, loudness normalization, and psychoacoustic filter design.`,
      },
      {
        id: '22.2', title: 'Timbre', page: 355, level: 'core',
        intuition: `Two instruments playing the same note sound different because their harmonic amplitudes, phases, and envelopes differ. That “color” is timbre.`,
        detail: `Timbre is determined by the spectral envelope (the relative amplitudes of harmonics), the temporal envelope (attack, decay, sustain, release), and subtle phase relationships. A violin and a flute playing A4 have the same fundamental but different harmonic mixtures and noise components. The ear is sensitive to spectral shape and timing, but relatively tolerant of phase differences for steady tones. Formants—resonant peaks in the vocal tract—shape vowel sounds. Timbre explains why a filter that changes the spectral envelope changes the perceived instrument, and why audio codecs must preserve the envelope even when discarding individual harmonics.`,
        keyPoints: [
          'Timbre = spectral envelope + temporal envelope + subtle phase/noise.',
          'Harmonic amplitudes distinguish instruments playing the same pitch.',
          'Formants are resonant peaks that identify vowel sounds.',
        ],
        application: `Synthesizers, audio effects, voice conversion, and instrument modeling.`,
      },
      {
        id: '22.3', title: 'Sound Quality vs. Data Rate', page: 358, level: 'core',
        intuition: `Audio can consume enormous data rates if stored naively. Compression exploits redundancy and perceptual limits to reduce bits without obvious quality loss.`,
        detail: `A CD-quality stereo signal (44.1 kHz, 16-bit, two channels) has a raw data rate of about 1.41 Mbit/s. Telephony uses 8 kHz, 8-bit companded speech, about 64 kbit/s. Perceptual codecs such as MP3 and AAC use filter banks or transforms, psychoacoustic masking, and entropy coding to reduce rates by an order of magnitude while preserving perceived quality. The tradeoff is bitrate versus distortion: lossless compression removes redundancy only; lossy compression removes information the listener is unlikely to notice. The book emphasizes that “quality” depends on the application and listener—speech, music, and critical monitoring have different requirements.`,
        formulas: [
          { label: 'Raw PCM bit rate', tex: 'R=f_s\\times N_{\\mathrm{bits}}\\times N_{\\mathrm{channels}}', vars: 'CD stereo: 44,100×16×2 ≈ 1.41 Mbit/s' },
        ],
        keyPoints: [
          'Raw PCM rate = sample rate × bits × channels.',
          'Lossless compression removes redundancy; lossy compression removes perceptual irrelevance.',
          'Codec quality is application- and listener-dependent.',
        ],
        application: `Streaming, podcasting, telephony, and archival audio.`,
      },
      {
        id: '22.4', title: 'High Fidelity Audio', page: 359, level: 'core',
        intuition: `High fidelity is not just a high sample rate. It is low noise, low distortion, flat frequency response, stable timing, and careful conversion.`,
        detail: `High-fidelity audio design considers the entire chain: microphone, preamp, anti-alias filter, ADC, digital processing, DAC, reconstruction filter, amplifier, and loudspeaker/room. Key specifications include dynamic range, total harmonic distortion plus noise (THD+N), frequency response flatness, channel matching, and jitter. Oversampling and sigma-delta conversion relax analog filter requirements. Dither preserves low-level detail when reducing bit depth. The book notes that 16-bit/44.1 kHz can already exceed the dynamic range and bandwidth of typical hearing, so higher rates and depths matter mainly for production, processing headroom, or ultrasonic content. The weakest link—often the room or transducer—usually dominates perceived quality.`,
        keyPoints: [
          'Fidelity is a system property, not a single number.',
          'Noise, distortion, response flatness, and jitter all matter.',
          'The room and loudspeakers often dominate perceived quality.',
        ],
        caveat: `Higher sample rates and bit depths are not automatically audible improvements. They can help processing and headroom, but the transducer/room bottleneck remains.`,
      },
      {
        id: '22.5', title: 'Companding', page: 362, level: 'core',
        intuition: `Companding compresses the dynamic range before transmission and expands it after reception. It lets 8-bit speech sound much better than plain 8-bit PCM.`,
        detail: `Companding applies a nonlinear transfer function that gives small amplitudes more quantization levels and large amplitudes fewer, matching the logarithmic sensitivity of hearing. μ-law (North America/Japan) and A-law (Europe) are the classic telephony standards; both use 8-bit samples at 8 kHz and achieve a dynamic range comparable to 12–13-bit linear PCM for speech. The compressor and expander must be exact inverses, or distortion results. In digital audio, companding can be applied before bit-depth reduction and expanded on playback; it is also related to the logarithmic quantization used in some metering and dynamics processing. The tradeoff is increased distortion for large signals and sensitivity to transmission errors.`,
        formulas: [
          { label: 'μ-law compression', tex: 'y=\\operatorname{sgn}(x)\\,\\frac{\\ln(1+\\mu|x|)}{\\ln(1+\\mu)}', vars: 'μ = 255 for telephony; |x|≤1' },
          { label: 'μ-law expansion', tex: 'x=\\operatorname{sgn}(y)\\,\\frac{(1+\\mu)^{|y|}-1}{\\mu}', vars: 'Inverse of compression' },
        ],
        keyPoints: [
          'Companding = compress dynamic range + expand at the receiver.',
          'μ-law/A-law are 8-bit telephony standards with ~12-bit speech quality.',
          'Compressor and expander must be exact inverses.',
        ],
        application: `Telephone networks, VoIP codecs, and dynamics processing in audio production.`,
      },
      {
        id: '22.6', title: 'Speech Synthesis and Recognition', page: 364, level: 'core',
        intuition: `Speech is produced by a source (vocal cords) shaped by a filter (vocal tract). Synthesis drives the filter; recognition infers the words from the filtered sound.`,
        detail: `The source-filter model represents voiced speech as a periodic glottal source filtered by the vocal tract, and unvoiced speech as noise filtered by the same tract. Formants are the resonant frequencies of the tract; changing them changes the vowel. Linear predictive coding (LPC) estimates the filter from short frames and transmits its coefficients plus excitation information, enabling very low bitrate speech coding. Speech recognition extracts features such as mel-frequency cepstral coefficients (MFCCs), models temporal patterns with hidden Markov models or neural networks, and decodes words with a language model. The book’s treatment is conceptual: the same DSP tools—windowing, Fourier analysis, filtering, and pattern recognition—underpin both directions.`,
        keyPoints: [
          'Source-filter model: glottal source + vocal-tract filter.',
          'Formants distinguish vowels; LPC estimates the tract filter.',
          'Recognition uses features, acoustic models, and a language model.',
        ],
        application: `Text-to-speech, voice assistants, hearing aids, and low-bitrate speech codecs.`,
      },
      {
        id: '22.7', title: 'Nonlinear Audio Processing', page: 368, level: 'advanced',
        intuition: `Not all distortion is bad. Compression, limiting, saturation, pitch shifting, and vocoding deliberately reshape audio in nonlinear ways to create loudness, character, or new sounds.`,
        detail: `Dynamic range compression reduces the gap between quiet and loud passages by applying a gain that depends on the signal envelope. Limiting prevents peaks from clipping. Saturation and distortion add harmonics, which can sound warm or aggressive. Pitch shifting changes playback rate while preserving duration (or vice versa) using time-frequency techniques. Vocoders impose the spectral envelope of one signal onto another. These processes are nonlinear and time-varying, so they do not obey superposition and can generate new frequencies. The book stresses that nonlinear processing is a legitimate part of audio DSP, but it must be designed and measured carefully: aliasing, harshness, and pumping are common failure modes.`,
        keyPoints: [
          'Compression/limiting are time-varying gain processes.',
          'Saturation/distortion add harmonics deliberately.',
          'Pitch shifting and vocoding require time-frequency processing.',
          'Nonlinear effects can alias and generate inharmonic artifacts.',
        ],
        application: `Music production, broadcast loudness control, guitar amplifiers, and creative sound design.`,
      },
    ],
    labs: [{
      id: 'audio',
      title: 'Hearing, companding, and data rate',
      intro: 'Explore equal-loudness curves, μ-law companding, and the bitrate of common audio formats. Hear or inspect how quantization noise changes with companding.',
      tasks: [
        'Compress and expand a low-level sine with μ-law. Compare the error with uniform quantization.',
        'Calculate the raw data rate for CD, telephone, and 96 kHz/24-bit stereo.',
        'Raise the quantization bits until the noise floor drops below the displayed hearing threshold.',
      ],
    }],
    worked: {
      title: 'How many bits does a CD need?',
      problem: 'A CD stores 44.1 kHz, 16-bit stereo audio. What is the raw bit rate, and how much data does a 4-minute song require?',
      steps: [
        { title: 'Compute samples per second', text: '$44{,}100$ samples/s per channel.' },
        { title: 'Multiply by bits and channels', text: '$44{,}100\\times16\\times2=1{,}411{,}200$ bit/s ≈ 1.41 Mbit/s.' },
        { title: 'Convert to bytes', text: '$1{,}411{,}200/8=176{,}400$ bytes/s.' },
        { title: 'Multiply by duration', text: '$176{,}400\\times240=42{,}336{,}000$ bytes ≈ 42.3 MB (uncompressed).' },
      ],
      answer: 'About 1.41 Mbit/s, or 42.3 MB for four minutes of uncompressed stereo. Perceptual compression can reduce this by roughly 5–10× with little audible loss for most listeners.',
    },
    misconceptions: [
      { wrong: 'CD quality is 16-bit because human hearing needs exactly 16 bits.', right: '16-bit/44.1 kHz was an engineering compromise that exceeds the dynamic range and bandwidth of most listening conditions. Higher depths help processing headroom and production, not necessarily playback.' },
      { wrong: 'Companding is the same as compression (dynamic range compression).', right: 'Companding is a paired nonlinear quantization/expansion for transmission. Dynamic-range compression is a time-varying gain effect. They are different processes.' },
      { wrong: 'All distortion is undesirable.', right: 'Saturation and harmonic distortion are deliberate creative tools. The problem is unwanted distortion, aliasing, and harshness.' },
    ],
    takeaways: [
      'Hearing is nonlinear, logarithmic, and masked; psychoacoustics drives audio compression.',
      'Timbre comes from spectral and temporal envelopes, not just pitch.',
      'Raw audio bit rate = sample rate × bits × channels; compression exploits redundancy and perception.',
      'Companding extends the effective dynamic range of small-word formats.',
      'Speech and audio systems combine filtering, transforms, and pattern recognition.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'The raw data rate of 48 kHz, 24-bit stereo PCM is:',
        options: ['1.15 Mbit/s', '2.30 Mbit/s', '4.60 Mbit/s', '48 Mbit/s'],
        answer: 1,
        explanation: '$48{,}000\\times24\\times2=2{,}304{,}000$ bit/s ≈ 2.30 Mbit/s.',
        wrongHints: { 0: 'That would be mono, or half the bit depth.', 2: 'That doubles the channel count again.', 3: '48 Mbit/s confuses the sample rate with the bit rate.' },
      },
      {
        type: 'mcq', question: 'μ-law companding improves perceived quality for 8-bit speech mainly because:',
        options: ['it increases the sample rate', 'it gives small amplitudes more quantization levels', 'it removes all high frequencies', 'it makes the signal linear'],
        answer: 1,
        explanation: 'The logarithmic transfer function matches hearing’s sensitivity, allocating more codes to quiet sounds and fewer to loud ones.',
        wrongHints: { 0: 'Companding does not change the sample rate.', 2: 'It shapes amplitude resolution, not bandwidth.', 3: 'Companding is deliberately nonlinear.' },
      },
      {
        type: 'tf', question: 'The source-filter model describes voiced speech as a periodic source shaped by the vocal tract.',
        options: ['True', 'False'], answer: 0,
        explanation: 'The glottal pulse train provides the source; the vocal tract acts as a time-varying filter whose resonances (formants) shape the sound.',
      },
    ],
  },

  {
    number: 23,
    title: 'Image Formation & Display',
    part: 'Applications',
    tagline: 'Pixels, perception, and the path from photons to displayed brightness.',
    intro: `An image is a two-dimensional signal: brightness (and color) as a function of position. Before we can filter or compress an image, we must understand how it is sampled, how the eye perceives it, and how it is displayed. Many image-processing failures are really acquisition or display failures.

This chapter covers digital image structure, cameras and the human eye, television signals, other acquisition and display technologies, brightness/contrast adjustments, grayscale transforms, and geometric warping. It establishes the coordinate and sampling conventions used in the image-processing chapters that follow.`,
    objectives: [
      'Describe digital image representation, resolution, and bit depth.',
      'Compare camera sensors with the human visual system.',
      'Explain video scanning, interlacing, and luminance/chroma encoding.',
      'Apply brightness, contrast, gamma, and grayscale transforms.',
      'Implement geometric warping with interpolation.',
    ],
    prerequisites: [3, 8],
    sections: [
      {
        id: '23.1', title: 'Digital Image Structure', page: 373, level: 'core',
        intuition: `A digital image is a grid of pixels, each holding a brightness or color value. The grid is a spatial sampling; the value is an amplitude quantization.`,
        detail: `A grayscale image is a 2-D array $f[x,y]$, where $x$ is the column and $y$ is the row. Each pixel has a value, often 8 bits (0–255) or 16 bits. Color images use multiple channels—typically red, green, and blue, or luminance plus chroma. Spatial resolution is the number of pixels; amplitude resolution is the bit depth. The image’s physical size and the pixel spacing determine the sampling frequency. A digital image is not a continuous picture: it is a set of samples, and displaying it requires interpolation and a mapping from numbers to light. The book emphasizes that resolution is not the same as pixel count: optical blur, lens aberrations, and the display can limit effective resolution.`,
        formulas: [
          { label: 'Grayscale image', tex: 'f[x,y],\\quad x=0,\\ldots,W-1,\\;y=0,\\ldots,H-1', vars: 'W×H pixels' },
          { label: 'Bit depth', tex: '2^B\\ \\text{levels}', vars: 'B bits per pixel' },
        ],
        keyPoints: [
          'Image = spatial samples × amplitude levels.',
          'Resolution is limited by optics and display, not just pixel count.',
          'Color can be RGB or luminance/chroma.',
        ],
      },
      {
        id: '23.2', title: 'Cameras and Eyes', page: 376, level: 'core',
        intuition: `A camera focuses light onto a sensor; an eye focuses light onto a retina. Both sample a continuous scene, but the eye’s sensitivity, dynamic range, and color processing are highly nonuniform.`,
        detail: `A camera lens forms an image on a CCD or CMOS sensor, which converts photons to charge. Sensor pixel size, fill factor, noise, and dynamic range determine image quality. The human eye has rods (low-light, achromatic) and cones (color, high-light), with a nonuniform distribution across the retina. Sensitivity is logarithmic over a huge range, and color perception is opponent-processed (red-green, blue-yellow). The eye’s spatial resolution is highest at the fovea and drops toward the periphery. These properties explain why images can be compressed aggressively in peripheral regions, why gamma correction is needed for display, and why brightness/contrast adjustments interact with perception.`,
        keyPoints: [
          'Camera: lens + sensor + readout; eye: lens + retina + neural processing.',
          'Human vision is logarithmic, color-opponent, and nonuniform in resolution.',
          'Perception guides display gamma and image compression.',
        ],
        application: `Camera pipeline design, display calibration, and perceptually motivated compression.`,
      },
      {
        id: '23.3', title: 'Television Video Signals', page: 384, level: 'support',
        intuition: `Analog television scans a scene line by line, encodes brightness and color, and synchronizes the display. Digital video inherits many of these conventions.`,
        detail: `Traditional television uses a raster scan: an electron beam (or equivalent) sweeps horizontally, line by line, from top to bottom. Interlacing refreshes alternate lines to reduce bandwidth while appearing smoother. Composite video combines luminance (Y) and chrominance (C) into one signal, with color modulated onto a subcarrier. NTSC and PAL differ in line count, frame rate, and color encoding. Synchronization pulses tell the display when a line or frame begins. Digital video standards replace analog scanning with sampled frames and digital color spaces (Y’CbCr), but the luminance/chroma separation and raster conventions remain. The book uses television to illustrate time-domain encoding and mixed time/frequency processing.`,
        keyPoints: [
          'Raster scanning converts a 2-D image into a 1-D time signal.',
          'Interlacing trades vertical resolution for bandwidth.',
          'Luminance/chroma separation underlies analog and digital video.',
        ],
        application: `Video capture, display, compression, and standards conversion.`,
      },
      {
        id: '23.4', title: 'Other Image Acquisition and Display', page: 386, level: 'support',
        intuition: `Images can come from X-rays, ultrasound, MRI, electron microscopes, or synthetic rendering. Each modality has its own physics and noise.`,
        detail: `CCD and CMOS sensors dominate visible-light imaging. Scanners move a sensor or mirror across a document. Ultrasound measures echo delays; X-ray CT measures attenuation along projections; MRI uses nuclear magnetic resonance and spatial encoding. Each modality produces data with different noise, resolution, and contrast characteristics. Display technologies—CRT, LCD, OLED, projectors—map digital values to light with different gamma, color gamuts, and viewing angles. The book stresses that acquisition and display are part of the signal chain: a perfect algorithm cannot recover detail the sensor never captured, and a mismatched display can hide or distort real improvements.`,
        keyPoints: [
          'Different modalities have different physics, noise, and resolution limits.',
          'Display gamma and gamut affect perceived image quality.',
          'Acquisition and display are part of the DSP chain.',
        ],
      },
      {
        id: '23.5', title: 'Brightness and Contrast Adjustments', page: 387, level: 'core',
        intuition: `Brightness shifts all pixel values up or down; contrast stretches or compresses the range around a reference. Both are simple pointwise transforms.`,
        detail: `A linear brightness/contrast transform is $g= \\alpha f+\\beta$. Increasing $\\alpha$ (gain) increases contrast; increasing $\\beta$ (offset) increases brightness. Values outside the display range are clipped, which can destroy detail. A window/level operation maps a selected range of input values to the full display range, useful in medical imaging. Gamma correction applies a power law, $g=f^\\gamma$, to compensate for nonlinear display or perception. Histogram stretching chooses $\\alpha$ and $\\beta$ from the image’s minimum and maximum. These operations are pointwise, so they do not blur or sharpen; they only remap amplitudes.`,
        formulas: [
          { label: 'Linear point transform', tex: 'g[x,y]=\\alpha f[x,y]+\\beta', vars: 'α = contrast gain, β = brightness offset' },
          { label: 'Gamma correction', tex: 'g=f^{\\gamma}', vars: 'γ>1 darkens midtones; γ<1 brightens' },
        ],
        keyPoints: [
          'Brightness = offset; contrast = gain around a reference.',
          'Clipping destroys highlight/shadow detail.',
          'Window/level selects a range for full-scale display.',
        ],
        application: `Photo editing, medical image display, and camera tone curves.`,
      },
      {
        id: '23.6', title: 'Grayscale Transforms', page: 390, level: 'core',
        intuition: `A grayscale transform replaces each pixel value with another using a lookup table. Inversion, thresholding, log scaling, and histogram equalization are all LUTs.`,
        detail: `A pointwise grayscale transform is $g=T(f)$, implemented as a lookup table for 8-bit images. Inversion ($g=255-f$) is useful for displaying negatives. Logarithmic scaling compresses a wide dynamic range, common in astronomy and HDR imaging. Thresholding converts grayscale to binary, useful for segmentation. Posterization reduces the number of levels for a stylized effect or compression. Histogram equalization chooses a monotonic mapping that makes the output histogram approximately uniform, increasing local contrast; it can over-enhance noise and is not always desirable. These transforms do not use spatial neighborhood information, so they cannot remove blur or noise—they only remap intensities.`,
        keyPoints: [
          'Grayscale transforms are pointwise lookup tables.',
          'Log scaling compresses dynamic range; thresholding binarizes.',
          'Histogram equalization increases contrast but can amplify noise.',
        ],
        application: `Medical display, astronomy, document binarization, and artistic effects.`,
      },
      {
        id: '23.7', title: 'Warping', page: 394, level: 'core',
        intuition: `Warping moves pixels to new positions to correct lens distortion, align images, or create geometric effects. Interpolation fills the gaps.`,
        detail: `A geometric warp defines a mapping from output coordinates to input coordinates, $(x,y)\\to(u,v)$. Affine transforms (translation, rotation, scaling, shear) preserve straight lines; perspective transforms preserve straight lines but not parallelism. For each output pixel, sample the input at the mapped location using nearest-neighbor, bilinear, or bicubic interpolation. Nearest-neighbor is fast but jagged; bilinear is smoother but blurs; bicubic preserves edges better at higher cost. Warping can be used to rectify a scanned document, register medical images, correct camera lens distortion, or create panoramic stitches. The book notes that resampling is a form of interpolation and can alias if the mapping compresses the image without prefiltering.`,
        formulas: [
          { label: 'Affine warp', tex: '\\begin{bmatrix}u\\\\v\\\\1\\end{bmatrix}=\\begin{bmatrix}a&b&c\\\\d&e&f\\\\0&0&1\\end{bmatrix}\\begin{bmatrix}x\\\\y\\\\1\\end{bmatrix}', vars: 'Translation, rotation, scale, shear' },
        ],
        keyPoints: [
          'Warping = coordinate mapping + interpolation.',
          'Affine preserves straight lines; perspective preserves lines but not parallelism.',
          'Bilinear is a common quality/speed compromise.',
        ],
        caveat: `Downscaling during warping requires prefiltering; otherwise high-frequency detail aliases. Interpolation alone does not prevent aliasing.`,
        application: `Document rectification, image registration, lens correction, and panorama stitching.`,
      },
    ],
    labs: [{
      id: 'image-basics',
      title: 'Pixels, brightness, and warping',
      intro: 'Load a synthetic test image and adjust brightness, contrast, gamma, and grayscale mapping. Apply a geometric warp with nearest-neighbor and bilinear interpolation.',
      tasks: [
        'Raise contrast until clipping occurs. Which details disappear?',
        'Apply gamma correction. How do the midtones change compared with a linear gain?',
        'Warp the image by a rotation. Compare nearest-neighbor and bilinear interpolation.',
      ],
    }],
    worked: {
      title: 'Compute a contrast stretch',
      problem: 'An 8-bit image uses only values 40–120. Stretch it linearly to the full 0–255 range. What are the gain and offset, and what happens to values outside the original range?',
      steps: [
        { title: 'Map the endpoints', text: 'We want 40→0 and 120→255. The gain is $\\alpha=255/(120-40)=3.1875$.' },
        { title: 'Find the offset', text: '$0=\\alpha(40)+\\beta$, so $\\beta=-127.5$.' },
        { title: 'Apply the transform', text: '$g=3.1875f-127.5$. The original range becomes 0–255.' },
        { title: 'Check clipping', text: 'Any input below 40 maps below 0 and clips to 0; any input above 120 maps above 255 and clips to 255. The stretch expands contrast but can clip outliers.' },
      ],
      answer: 'Gain ≈3.19, offset ≈−127.5. The used range expands to full scale, with clipping outside 40–120. A percentile-based stretch is safer when outliers are present.',
    },
    misconceptions: [
      { wrong: 'More pixels always means higher image resolution.', right: 'Optical blur, lens aberrations, sensor noise, and display resolution can limit effective resolution. Upsampling adds pixels but not detail.' },
      { wrong: 'Brightness and contrast are independent of gamma.', right: 'Display and perception are nonlinear. Gamma changes midtone brightness and contrast in ways a simple offset/gain cannot.' },
      { wrong: 'Bilinear interpolation is always better than nearest-neighbor.', right: 'Bilinear is smoother but blurs. Nearest-neighbor preserves hard pixel values and is preferred for some masks/index images.' },
    ],
    takeaways: [
      'Images are spatially sampled, amplitude-quantized signals.',
      'Human vision is logarithmic, color-opponent, and nonuniform; it guides display and compression.',
      'Video raster scanning converts 2-D images into 1-D time signals.',
      'Brightness/contrast/gamma are pointwise intensity mappings; warping adds geometry and interpolation.',
      'Acquisition and display limits bound what image processing can achieve.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'An 8-bit grayscale image can represent how many intensity levels?',
        options: ['8', '64', '256', '1024'],
        answer: 2,
        explanation: '8 bits give 2^8 = 256 levels, typically 0–255.',
        wrongHints: { 0: '8 is the bit depth, not the number of levels.', 1: '64 would be 6 bits.', 3: '1024 would be 10 bits.' },
      },
      {
        type: 'mcq', question: 'Which operation is pointwise and cannot remove blur?',
        options: ['Convolution with a sharpening kernel', 'Brightness/contrast adjustment', 'Median filtering', 'Bilinear warping'],
        answer: 1,
        explanation: 'Brightness/contrast remaps each pixel independently. It cannot use neighborhood information, so it cannot restore blurred detail.',
        wrongHints: { 0: 'Sharpening uses neighboring pixels and can increase apparent detail.', 2: 'Median filtering uses a neighborhood and can remove noise.', 3: 'Warping resamples using neighboring pixels.' },
      },
      {
        type: 'tf', question: 'Interlacing displays all lines of a frame simultaneously.',
        options: ['True', 'False'], answer: 1,
        explanation: 'Interlacing displays alternating sets of lines in successive fields, reducing bandwidth at the cost of motion artifacts and vertical resolution.',
      },
    ],
  },

  {
    number: 24,
    title: 'Linear Image Processing',
    part: 'Applications',
    tagline: 'Convolution in two dimensions: blur, sharpen, detect edges, and filter in frequency.',
    intro: `Linear image processing applies the same convolution and Fourier tools as one-dimensional DSP, but in two dimensions. A small kernel can blur, sharpen, emboss, or detect edges; a large kernel can flatten uneven illumination; a 2-D FFT can filter oriented textures and periodic noise.

This chapter covers 2-D convolution, 3×3 edge-modification kernels, separable convolution, large point-spread functions, Fourier image analysis, FFT convolution, and the practical details of boundary handling and kernel orientation.`,
    objectives: [
      'Perform 2-D convolution and interpret point-spread functions.',
      'Design 3×3 kernels for smoothing, sharpening, and edge detection.',
      'Exploit separability to reduce computation.',
      'Use frequency-domain filtering and FFT convolution for images.',
      'Handle boundaries and kernel orientation correctly.',
    ],
    prerequisites: [6, 7, 8, 23],
    sections: [
      {
        id: '24.1', title: 'Convolution', page: 397, level: 'core',
        intuition: `Image convolution slides a small kernel over every pixel, multiplying and summing the neighborhood. The kernel is the point-spread function: it describes how a point of light spreads.`,
        detail: `For a 2-D image $f[x,y]$ and kernel $h[i,j]$, convolution is $g[x,y]=\\sum_i\\sum_j h[i,j]f[x-i,y-j]$. A normalized box kernel blurs; a Gaussian kernel blurs smoothly; a kernel with a negative center and positive surround sharpens; a first-difference kernel detects edges. The kernel’s sum controls brightness: sum=1 preserves average brightness, sum=0 responds only to variation. Boundary handling—zero padding, replication, mirroring, or cropping—changes edge behavior. Convolution is linear and shift-invariant, so it can be analyzed in the frequency domain. The kernel is also called the point-spread function (PSF), especially in optics and astronomy.`,
        formulas: [
          { label: '2-D convolution', tex: 'g[x,y]=\\sum_i\\sum_j h[i,j]\\,f[x-i,y-j]', vars: 'h = kernel / PSF' },
          { label: 'Normalized box blur', tex: 'h=\\frac{1}{9}\\begin{bmatrix}1&1&1\\\\1&1&1\\\\1&1&1\\end{bmatrix}', vars: '3×3 average' },
        ],
        keyPoints: [
          'Kernel = point-spread function; convolution = shift-and-add blur.',
          'Kernel sum = 1 preserves brightness; sum = 0 preserves edges only.',
          'Boundary handling affects edges and must be specified.',
        ],
        application: `Gaussian blur, unsharp masking, edge detection, and optical PSF modeling.`,
      },
      {
        id: '24.2', title: '3×3 Edge Modification', page: 402, level: 'core',
        intuition: `A 3×3 kernel is a tiny image-processing program. Positive weights smooth; a positive center with negative neighbors sharpens; opposing signs detect edges.`,
        detail: `Common 3×3 kernels include the box blur (all ones, normalized), the sharpen kernel (center positive, neighbors negative, sum=1), the Laplacian (center negative, neighbors positive, sum=0), and Sobel operators for horizontal and vertical gradients. The sharpen kernel amplifies high frequencies and noise; the Laplacian responds to edges but also to noise; Sobel gives a smoothed gradient. Edge magnitude is $\\sqrt{G_x^2+G_y^2}$, and edge direction is $\\arctan(G_y/G_x)$. The book emphasizes that these kernels are linear and can be combined or cascaded. They are the building blocks of more elaborate feature detectors.`,
        formulas: [
          { label: 'Sharpen kernel', tex: '\\begin{bmatrix}0&-1&0\\\\-1&5&-1\\\\0&-1&0\\end{bmatrix}', vars: 'Sum = 1; boosts high frequencies' },
          { label: 'Sobel X', tex: '\\begin{bmatrix}-1&0&1\\\\-2&0&2\\\\-1&0&1\\end{bmatrix}', vars: 'Horizontal gradient' },
          { label: 'Laplacian', tex: '\\begin{bmatrix}0&1&0\\\\1&-4&1\\\\0&1&0\\end{bmatrix}', vars: 'Isotropic edge response' },
        ],
        keyPoints: [
          'Sharpen boosts edges and noise; blur suppresses both.',
          'Sobel combines smoothing with differentiation.',
          'Laplacian is sensitive to noise; pre-smooth when necessary.',
        ],
        application: `Photo sharpening, industrial inspection, medical edge enhancement, and feature extraction.`,
      },
      {
        id: '24.3', title: 'Convolution by Separability', page: 404, level: 'core',
        intuition: `Some 2-D kernels are the outer product of two 1-D kernels. Convolve rows, then columns: the same result with far fewer operations.`,
        detail: `A separable kernel satisfies $h[i,j]=h_x[i]h_y[j]$. The box and Gaussian kernels are separable. Convolving an $W\\times H$ image with a $K\\times K$ kernel costs $O(WHK^2)$ directly; separable convolution costs $O(WHK)$—a factor of K savings. For a Gaussian, the 1-D kernel is sampled from $e^{-x^2/(2\\sigma^2)}$ and normalized. Separability also enables efficient recursive Gaussian approximations and multi-scale pyramids. Not all kernels are separable; the Laplacian and Sobel are not fully separable in the same simple way, though they can often be decomposed into sums of separable terms. The book highlights separability as a key practical optimization for large blurs.`,
        formulas: [
          { label: 'Separable kernel', tex: 'h[i,j]=h_x[i]\\,h_y[j]', vars: 'Outer product of 1-D kernels' },
          { label: 'Cost reduction', tex: 'O(WHK^2)\\ \\longrightarrow\\ O(WHK)', vars: 'Convolve rows, then columns' },
        ],
        keyPoints: [
          'Separable kernels = outer product of two 1-D kernels.',
          'Cost drops by a factor of K for a K×K kernel.',
          'Gaussian and box kernels are separable.',
        ],
        application: `Real-time Gaussian blur, image pyramids, and large-kernel smoothing.`,
      },
      {
        id: '24.4', title: 'Example of a Large PSF: Illumination Flattening', page: 407, level: 'core',
        intuition: `Uneven lighting is a low-frequency multiplicative pattern. Estimate it with a large blur, then divide or subtract it to flatten the image.`,
        detail: `If an image is $f[x,y]=s[x,y]\\,l[x,y]$, where $s$ is the scene and $l$ is a slowly varying illumination field, a large blur of $f$ estimates $l$ (assuming the scene averages out). Dividing $f$ by the estimate yields a flattened image; subtracting a scaled version can also work. This is the basis of flat-field correction in microscopy and astronomy, and of unsharp masking when the “large PSF” is a blur of the image itself. The method assumes the illumination varies slowly compared with the scene and that the scene’s local average is roughly constant. Large kernels are expensive; separable or FFT convolution makes them practical.`,
        formulas: [
          { label: 'Illumination model', tex: 'f[x,y]=s[x,y]\\,l[x,y]', vars: 'Multiplicative shading' },
          { label: 'Flat-field correction', tex: '\\hat{s}[x,y]=\\frac{f[x,y]}{\\mathrm{blur}(f)[x,y]}', vars: 'Blur estimates the illumination' },
        ],
        keyPoints: [
          'Large blur estimates slow illumination variations.',
          'Divide or subtract the estimate to flatten.',
          'Assumes scene and illumination are separable by scale.',
        ],
        application: `Microscopy flat-field correction, document shadow removal, and astronomical background subtraction.`,
      },
      {
        id: '24.5', title: 'Fourier Image Analysis', page: 410, level: 'core',
        intuition: `The 2-D Fourier transform reveals spatial frequencies and orientations. Smooth regions live near the center; edges and textures live farther out.`,
        detail: `The 2-D DFT of an image has a magnitude spectrum symmetric about the origin (for real images). Low frequencies correspond to broad brightness variations; high frequencies correspond to edges, fine texture, and noise. Oriented structures produce energy along a line perpendicular to their orientation. Periodic interference (e.g., scan lines or moiré) appears as isolated peaks, which can be removed with a notch filter. Windowing reduces edge leakage, and zero padding interpolates the spectrum. The phase spectrum contains structural information and is often more important than magnitude for image appearance. Fourier filtering is global and can introduce ringing at edges; spatial kernels are often preferred for local operations.`,
        keyPoints: [
          '2-D spectra encode spatial frequency and orientation.',
          'Periodic noise appears as isolated spectral peaks.',
          'Phase carries structure; magnitude alone is not the image.',
        ],
        application: `Removing scan-line noise, texture analysis, and image registration.`,
      },
      {
        id: '24.6', title: 'FFT Convolution', page: 416, level: 'core',
        intuition: `For large kernels, 2-D FFT convolution is much faster than sliding the kernel over every pixel. Zero-pad to avoid wraparound.`,
        detail: `To convolve an image of size $W\\times H$ with a kernel of size $K\\times K$, zero-pad both to at least $(W+K-1)\\times(H+K-1)$, compute 2-D FFTs, multiply pointwise, and inverse-transform. The result is the linear convolution; the valid region excludes the padding. For periodic boundary conditions, no padding is needed, but the image edges wrap. FFT convolution costs $O(WH\\log(WH))$ versus $O(WHK^2)$ direct, so it wins for large kernels. Memory and transform overhead matter for small images. The book presents this as the 2-D analog of Chapter 18.`,
        formulas: [
          { label: '2-D linear convolution', tex: 'g=\\mathrm{IFFT}\\{F\\cdot H\\}', vars: 'Zero-pad to (W+K−1)×(H+K−1)' },
        ],
        keyPoints: [
          'Zero-pad to avoid circular wraparound.',
          'FFT wins for large kernels; direct wins for small kernels.',
          'Periodic boundaries are sometimes desirable, often not.',
        ],
        application: `Large Gaussian blurs, deconvolution, and frequency-domain filtering.`,
      },
      {
        id: '24.7', title: 'A Closer Look at Image Convolution', page: 418, level: 'advanced',
        intuition: `The details matter: kernel orientation, boundary rule, normalization, and color channels can make a correct algorithm produce wrong-looking images.`,
        detail: `Convolution flips the kernel; correlation does not. Many image-processing libraries call correlation “convolution,” which matters for asymmetric kernels. The kernel origin (center) must be defined consistently; even-sized kernels have no exact center. Boundary handling—zero, replicate, reflect, wrap—changes edge brightness and can create artifacts. Normalization controls gain: a blur kernel should sum to one; an edge kernel should sum to zero. Color images require deciding whether to process luminance only, each channel independently, or a perceptual color space. Processing RGB channels independently can shift hue; processing luminance preserves color but may miss chroma noise. The book encourages testing kernels on simple synthetic images before applying them to real data.`,
        keyPoints: [
          'Convolution flips the kernel; correlation does not.',
          'Kernel origin and boundary rule must be explicit.',
          'Normalize blur kernels to sum 1; edge kernels to sum 0.',
          'Choose color space deliberately; RGB processing can shift hue.',
        ],
        caveat: `A kernel that looks correct on a symmetric test image may behave differently on asymmetric features if orientation or origin is wrong.`,
      },
    ],
    labs: [{
      id: 'image-convolution',
      title: 'Kernels, separability, and spectra',
      intro: 'Apply blur, sharpen, Sobel, and Laplacian kernels to a test image. Compare direct and separable convolution, and inspect the 2-D spectrum before and after filtering.',
      tasks: [
        'Blur with a 9×9 box kernel. Compare direct and separable implementations for speed and output.',
        'Sharpen the image. Where does noise become visible?',
        'Add periodic stripe noise and remove it with a frequency-domain notch.',
      ],
    }],
    worked: {
      title: 'How much does separability save?',
      problem: 'A 1024×1024 image is convolved with a 15×15 Gaussian kernel. Compare the number of multiply–accumulates for direct and separable convolution.',
      steps: [
        { title: 'Direct cost', text: 'Each pixel requires $15\\times15=225$ multiplies, so $1024^2\\times225\\approx236$ million operations.' },
        { title: 'Separable cost', text: 'Two 1-D passes, each with 15 multiplies per pixel: $2\\times15\\times1024^2\\approx31.5$ million operations.' },
        { title: 'Compute the ratio', text: '$236/31.5\\approx7.5$. The separable version is about 7.5× cheaper—close to the expected factor of K/2=7.5 for two passes.' },
        { title: 'Interpret', text: 'The saving grows with kernel size. For a 31×31 kernel, separable convolution is about 15× cheaper.' },
      ],
      answer: 'About 236M vs 31.5M multiply–accumulates, a 7.5× saving. Separability is essential for real-time large-kernel blurs.',
    },
    misconceptions: [
      { wrong: 'Image convolution and correlation are the same because kernels are usually symmetric.', right: 'They differ for asymmetric kernels. Many libraries implement correlation and call it convolution; check the convention.' },
      { wrong: 'A larger blur kernel always gives a smoother, better result.', right: 'Large kernels blur more but also cost more and can create boundary artifacts. Separable or FFT methods make them practical.' },
      { wrong: 'Sharpening restores detail that was lost in blur.', right: 'Sharpening amplifies existing high-frequency content; it cannot recover information destroyed by optical blur or compression.' },
    ],
    takeaways: [
      '2-D convolution = shift-and-add with a point-spread function.',
      '3×3 kernels can blur, sharpen, or detect edges; normalization matters.',
      'Separable kernels reduce cost from O(K²) to O(K) per pixel.',
      'Large PSFs model illumination and blur; FFT convolution makes them practical.',
      'Frequency-domain image analysis reveals orientation and periodic noise.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'A 3×3 kernel with all ones divided by 9 performs:',
        options: ['edge detection', 'a 3×3 average blur', 'sharpening', 'a geometric warp'],
        answer: 1,
        explanation: 'The kernel averages the 3×3 neighborhood and normalizes by 9 so the average brightness is preserved.',
        wrongHints: { 0: 'An edge kernel has positive and negative weights summing to zero.', 2: 'Sharpening uses a positive center with negative neighbors.', 3: 'Warping changes coordinates, not pixel neighborhoods.' },
      },
      {
        type: 'mcq', question: 'Separable convolution reduces the cost of a K×K kernel from O(K²) to:',
        options: ['O(1)', 'O(K)', 'O(K log K)', 'O(K³)'],
        answer: 1,
        explanation: 'Two 1-D passes each cost O(K) per pixel, so the total is O(K) per pixel instead of O(K²).',
        wrongHints: { 0: 'Convolution still depends on kernel size.', 2: 'That is an FFT-style cost, not separability.', 3: 'Separability reduces, not increases, the exponent.' },
      },
      {
        type: 'tf', question: 'To compute linear 2-D convolution with an FFT, you must zero-pad the image and kernel.',
        options: ['True', 'False'], answer: 0,
        explanation: 'Without padding, the FFT computes circular convolution and the kernel wraps around the image edges.',
      },
    ],
  },

  {
    number: 25,
    title: 'Special Imaging Techniques',
    part: 'Applications',
    tagline: 'Resolution, noise, shape, and the mathematics of seeing inside objects.',
    intro: `Image quality is not just pixel count. It depends on the point-spread function, sampling aperture, noise, and the processing used to extract structure. This chapter examines four special topics: spatial resolution, sample spacing and aperture, signal-to-noise ratio, morphological image processing, and computed tomography.

These techniques appear in microscopy, astronomy, medical imaging, industrial inspection, and remote sensing. They also illustrate a broader lesson: the best image processing starts with an understanding of the imaging physics.`,
    objectives: [
      'Define spatial resolution using PSF, MTF, and line pairs.',
      'Explain how sample spacing and aperture affect aliasing.',
      'Compute and interpret image signal-to-noise ratio.',
      'Apply erosion, dilation, opening, and closing.',
      'Explain CT projections and filtered backprojection.',
    ],
    prerequisites: [23, 24],
    sections: [
      {
        id: '25.1', title: 'Spatial Resolution', page: 423, level: 'core',
        intuition: `Resolution is the smallest detail an imaging system can distinguish—not the number of pixels. A million-pixel sensor behind a blurry lens still produces a blurry image.`,
        detail: `Spatial resolution is characterized by the point-spread function (PSF), the image of an ideal point source. A narrower PSF means better resolution. The modulation transfer function (MTF) is the magnitude of the PSF’s Fourier transform; it describes how strongly each spatial frequency is transferred. Resolution is often quoted in line pairs per millimeter or by the Rayleigh criterion (the separation at which two points are just distinguishable). Pixel spacing sets the maximum representable spatial frequency (Nyquist), but optical blur, diffraction, aberrations, and motion can reduce resolution below that limit. The book emphasizes that resolution and pixel count are different: oversampling a blurry image does not create detail.`,
        formulas: [
          { label: 'Nyquist spatial frequency', tex: 'f_{\\max}=\\frac{1}{2\\Delta x}', vars: 'Δx = pixel spacing' },
          { label: 'Rayleigh criterion', tex: '\\Delta\\theta\\approx1.22\\frac{\\lambda}{D}', vars: 'Circular aperture, diameter D' },
        ],
        keyPoints: [
          'Resolution is set by the PSF/MTF, not just pixel count.',
          'Pixel spacing limits the maximum spatial frequency.',
          'Optical blur and motion can dominate the PSF.',
        ],
        application: `Microscope objective selection, satellite image interpretation, and camera lens evaluation.`,
      },
      {
        id: '25.2', title: 'Sample Spacing and Sampling Aperture', page: 430, level: 'core',
        intuition: `A sensor pixel integrates light over its finite area. That aperture acts as a low-pass filter before sampling; too-large pixels blur, too-small pixels alias.`,
        detail: `Each detector element has a finite width (the sampling aperture) and a fill factor. The aperture’s spatial response is convolved with the scene before sampling, which attenuates high spatial frequencies—an inherent anti-alias filter. If the aperture is too small relative to the pixel spacing, the system samples fine detail that it cannot represent, causing aliasing (moire, jagged edges). If the aperture is too large, it blurs detail. Optical low-pass filters and lens diffraction also shape the MTF. The sampling theorem applies in two dimensions: the image must be band-limited below the 2-D Nyquist frequency. The book uses this to explain why simply shrinking pixels does not always improve image quality.`,
        keyPoints: [
          'Detector aperture integrates light and low-pass filters the image.',
          'Too-small apertures alias; too-large apertures blur.',
          '2-D sampling requires band-limiting in both directions.',
        ],
        application: `Sensor design, camera anti-aliasing filters, and microscope pixel-size selection.`,
      },
      {
        id: '25.3', title: 'Signal-to-Noise Ratio', page: 432, level: 'core',
        intuition: `Even a perfectly focused image is useless if noise swamps the signal. SNR compares the meaningful contrast to the random fluctuations.`,
        detail: `Image noise comes from photon shot noise (Poisson, proportional to √signal), read noise, dark current, and quantization. SNR is the ratio of mean signal to noise standard deviation, often expressed in dB. Averaging multiple frames reduces random noise by √N if the noise is independent. Binning pixels increases signal per pixel but reduces spatial resolution. The Rose criterion suggests that an SNR of about 5 is needed to reliably detect a feature. Exposure time, aperture, and sensor gain trade signal against noise and motion blur. The book emphasizes measuring noise in a uniform region and distinguishing it from fixed-pattern noise, which does not average away.`,
        formulas: [
          { label: 'SNR', tex: '\\mathrm{SNR}=\\frac{\\mu_{\\mathrm{signal}}}{\\sigma_{\\mathrm{noise}}}', vars: 'Often expressed as 20 log₁₀(SNR) dB' },
          { label: 'Frame averaging', tex: '\\sigma_{\\mathrm{avg}}=\\frac{\\sigma}{\\sqrt{N}}', vars: 'Independent noise, N frames' },
        ],
        keyPoints: [
          'Shot noise grows as √signal; read noise is signal-independent.',
          'Averaging N frames reduces random noise by √N.',
          'Fixed-pattern noise does not average away; calibrate it.',
        ],
        application: `Astronomy, fluorescence microscopy, low-dose CT, and night photography.`,
      },
      {
        id: '25.4', title: 'Morphological Image Processing', page: 436, level: 'core',
        intuition: `Morphology probes an image with a small shape (the structuring element). Erosion shrinks bright regions; dilation expands them; opening and closing clean up shapes.`,
        detail: `For binary images, erosion sets a pixel to 1 only if the structuring element fits entirely inside the foreground; dilation sets it to 1 if any element overlaps the foreground. Opening (erosion then dilation) removes small objects and thin protrusions; closing (dilation then erosion) fills small holes and gaps. These operations are nonlinear and do not obey superposition, but they preserve shape and are robust to noise. Grayscale morphology replaces min/max for erosion/dilation. Applications include removing salt-and-pepper noise, separating touching objects, extracting boundaries, and computing skeletons. The structuring element’s shape and size encode prior knowledge about the objects of interest.`,
        formulas: [
          { label: 'Erosion', tex: '(A\\ominus B)(x)=\\min_{b\\in B}A(x+b)', vars: 'B = structuring element' },
          { label: 'Dilation', tex: '(A\\oplus B)(x)=\\max_{b\\in B}A(x-b)', vars: 'Expands bright regions' },
        ],
        keyPoints: [
          'Erosion shrinks, dilation expands.',
          'Opening removes small objects; closing fills small holes.',
          'Morphology is nonlinear and shape-aware.',
        ],
        application: `Industrial defect detection, cell counting, document cleanup, and medical segmentation.`,
      },
      {
        id: '25.5', title: 'Computed Tomography', page: 442, level: 'advanced',
        intuition: `CT reconstructs a cross-section from X-ray projections taken at many angles. Each projection is a set of line integrals; the collection is a sinogram.`,
        detail: `The Radon transform maps an image to its projections: for each angle, sum attenuation along parallel lines. A CT scanner rotates an X-ray source and detector around the patient, measuring these projections. Simple backprojection smears each projection back across the image, producing a blurry reconstruction; filtered backprojection applies a ramp filter to each projection before backprojecting, sharpening the result. The Fourier slice theorem relates projections to radial slices of the 2-D Fourier transform. Practical CT must handle noise, beam hardening, scatter, motion, and limited angles. Iterative reconstruction can improve quality at lower dose but is computationally intensive. The book presents the core mathematics to show how a set of 1-D measurements becomes a 2-D image.`,
        formulas: [
          { label: 'Radon transform', tex: 'p(\\theta,t)=\\iint f(x,y)\\,\\delta(t-x\\cos\\theta-y\\sin\\theta)\\,dx\\,dy', vars: 'Projection at angle θ' },
          { label: 'Filtered backprojection', tex: 'f(x,y)=\\int_0^{\\pi}\\left[p(\\theta,\\cdot)*h\\right](x\\cos\\theta+y\\sin\\theta)\\,d\\theta', vars: 'h = ramp filter' },
        ],
        keyPoints: [
          'CT measures line integrals (projections) at many angles.',
          'Backprojection alone blurs; a ramp filter restores sharpness.',
          'The Fourier slice theorem links projections and the 2-D spectrum.',
        ],
        application: `Medical CT, industrial non-destructive testing, and seismic tomography.`,
      },
    ],
    labs: [{
      id: 'imaging-special',
      title: 'Resolution, morphology, and CT',
      intro: 'Blur a test target, add noise, and apply morphological operations. Then reconstruct a synthetic phantom from projections with and without the ramp filter.',
      tasks: [
        'Increase the PSF width. At what point can two nearby bars no longer be separated?',
        'Apply opening and closing to a noisy binary image. Which operation removes speckles, and which fills holes?',
        'Compare unfiltered and filtered backprojection. What does the ramp filter restore?',
      ],
    }],
    worked: {
      title: 'How many projections are needed?',
      problem: 'A CT reconstruction uses 180 angles over 180°. The detector has 512 samples across a 300 mm field of view. What is the approximate pixel spacing and the angular sampling step?',
      steps: [
        { title: 'Detector spacing', text: '$300\\ \\mathrm{mm}/512\\approx0.586$ mm per detector sample.' },
        { title: 'Angular step', text: '$180°/180=1°$ per projection.' },
        { title: 'Relate to resolution', text: 'The reconstruction grid should not be much finer than the detector spacing; oversampling the grid does not add information.' },
        { title: 'Consider aliasing', text: 'Too few angles can produce streak artifacts; too few detector samples can miss fine structure. Both must satisfy sampling requirements for the desired resolution.' },
      ],
      answer: 'About 0.586 mm detector spacing and 1° angular steps. The reconstruction resolution is limited by both; increasing the grid size alone does not improve it.',
    },
    misconceptions: [
      { wrong: 'More megapixels always means better spatial resolution.', right: 'Resolution is limited by the PSF/MTF, aperture, diffraction, and noise. Oversampling a blurry image adds no detail.' },
      { wrong: 'Morphological operations are linear filters.', right: 'Erosion and dilation are nonlinear min/max operations. They do not obey superposition.' },
      { wrong: 'CT reconstruction is just backprojection.', right: 'Unfiltered backprojection is blurry. Filtered backprojection applies a ramp filter to each projection before summing.' },
    ],
    takeaways: [
      'Spatial resolution is a system property described by the PSF/MTF.',
      'Detector aperture both band-limits and blurs; sampling too coarsely aliases.',
      'SNR is set by photon statistics, read noise, and averaging. Morphology extracts shape using nonlinear operations.',
      'CT reconstructs images from projections; filtered backprojection is the classic algorithm.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'If a detector has 0.5 mm pixel spacing, the Nyquist spatial frequency is:',
        options: ['0.5 cycles/mm', '1 cycle/mm', '2 cycles/mm', '4 cycles/mm'],
        answer: 1,
        explanation: '$f_{\\max}=1/(2\\Delta x)=1/(2\\times0.5)=1$ cycle/mm.',
        wrongHints: { 0: 'That would be 1/Δx without the factor of two.', 2: 'That is 1/Δx, the sampling frequency, not the Nyquist frequency.', 3: 'That would require 0.125 mm spacing.' },
      },
      {
        type: 'mcq', question: 'Which morphological operation removes small bright speckles?',
        options: ['Dilation', 'Opening (erosion then dilation)', 'Closing (dilation then erosion)', 'Convolution with a box kernel'],
        answer: 1,
        explanation: 'Opening erodes away small objects and thin protrusions, then dilates the surviving larger structures back to size.',
        wrongHints: { 0: 'Dilation expands bright regions, making speckles larger.', 2: 'Closing fills small holes and gaps, not removes speckles.', 3: 'A box blur is linear and smears speckles rather than removing them.' },
      },
      {
        type: 'tf', question: 'Filtered backprojection applies a ramp filter to projections before backprojecting.',
        options: ['True', 'False'], answer: 0,
        explanation: 'The ramp filter compensates for the 1/|f| blurring inherent in backprojection, restoring sharpness.',
      },
    ],
  },

  {
    number: 26,
    title: 'Neural Networks (and more!)',
    part: 'Applications',
    tagline: 'Learning nonlinear decision rules from examples—and using them to design filters.',
    intro: `Traditional DSP is built from explicit algorithms: filters, transforms, and detectors designed by an engineer. Neural networks take a different approach: they learn a nonlinear mapping from examples. For problems such as target detection, handwriting recognition, or nonlinear system identification, that flexibility can outperform hand-crafted rules—if the data are adequate and the model is validated.

This chapter introduces target detection, network architecture, the reason nonlinear layers work, training by backpropagation, evaluation, and the use of neural networks to design recursive filters. It treats neural networks as one more DSP tool, with assumptions and failure modes.`,
    objectives: [
      'Frame a detection problem as feature extraction plus classification.',
      'Describe a feedforward neural network and its activation functions.',
      'Explain why hidden layers create nonlinear decision boundaries.',
      'Train a network with backpropagation and evaluate it properly.',
      'Recognize overfitting, data leakage, and model-validation risks.',
    ],
    prerequisites: [5, 8, 22, 25],
    sections: [
      {
        id: '26.1', title: 'Target Detection', page: 451, level: 'core',
        intuition: `Detection asks a yes/no question: is the target present? The art is choosing features that separate target from clutter, then setting a threshold that balances misses and false alarms.`,
        detail: `A detection system extracts features from a signal or image—energy, spectral peaks, edges, texture, or learned representations—and combines them into a score. A threshold converts the score into a decision. The receiver operating characteristic (ROC) curve plots detection probability against false-alarm probability as the threshold varies; the area under the curve (AUC) summarizes separability. The Neyman–Pearson criterion maximizes detection for a fixed false-alarm rate. In real systems, clutter, nonstationary noise, and rare targets make threshold selection difficult. Neural networks can learn features and decision boundaries jointly, but they still face the same fundamental tradeoff: no classifier can eliminate false alarms without also missing some targets.`,
        formulas: [
          { label: 'Detection rate', tex: 'P_D=\\frac{\\text{true positives}}{\\text{true positives}+\\text{false negatives}}', vars: 'Probability of detecting a present target' },
          { label: 'False-alarm rate', tex: 'P_{FA}=\\frac{\\text{false positives}}{\\text{false positives}+\\text{true negatives}}', vars: 'Probability of declaring a target when none is present' },
        ],
        keyPoints: [
          'Detection = features + score + threshold.',
          'ROC/AUC summarize the detection/false-alarm tradeoff.',
          'No threshold eliminates both misses and false alarms.',
        ],
        application: `Radar target detection, medical lesion screening, industrial defect inspection, and speech keyword spotting.`,
      },
      {
        id: '26.2', title: 'Neural Network Architecture', page: 458, level: 'core',
        intuition: `A neural network is a stack of weighted sums and nonlinear activations. Each layer transforms its input into a more useful representation; the last layer produces a decision.`,
        detail: `A feedforward network has an input layer, one or more hidden layers, and an output layer. Each neuron computes $z=\\sum_i w_i x_i+b$ followed by a nonlinear activation such as ReLU, sigmoid, or tanh. The weights and biases are learned from data. A single neuron can only draw a linear decision boundary; hidden layers compose nonlinear features, allowing curved boundaries and hierarchical representations. The output layer uses a sigmoid for binary classification, softmax for multiple classes, or a linear unit for regression. Network depth and width control capacity; more capacity can fit complex functions but also overfit. The book’s treatment predates deep learning but captures the essential architecture.`,
        formulas: [
          { label: 'Neuron', tex: 'a=\\phi\\!\\left(\\sum_i w_i x_i+b\\right)', vars: 'φ = activation function' },
          { label: 'ReLU', tex: '\\phi(z)=\\max(0,z)', vars: 'Common hidden-layer activation' },
        ],
        keyPoints: [
          'Neuron = weighted sum + bias + nonlinear activation.',
          'Hidden layers compose nonlinear features.',
          'Output activation matches the task: sigmoid, softmax, or linear.',
        ],
      },
      {
        id: '26.3', title: 'Why Does It Work?', page: 463, level: 'core',
        intuition: `Hidden layers let the network bend the decision boundary. With enough neurons, a network can approximate almost any continuous function—but that flexibility is also a risk.`,
        detail: `A single perceptron computes a linear boundary. Stacking nonlinear layers allows the network to represent piecewise-linear or smooth curved boundaries, and deeper layers can build hierarchical features (edges → shapes → objects). Universal approximation theorems say that a sufficiently wide network can approximate any continuous function on a compact domain, but they do not guarantee that training will find the right weights or that the network will generalize. The book emphasizes the difference between *capacity* (what the network can represent) and *learnability* (what can be estimated from finite, noisy data). Regularization, early stopping, and validation are essential.`,
        keyPoints: [
          'Nonlinear hidden layers create nonlinear decision boundaries.',
          'Universal approximation is an existence result, not a training guarantee.',
          'Capacity must be controlled to generalize from limited data.',
        ],
        caveat: `A network can fit the training data perfectly and still fail on new data. Always evaluate on held-out data.`,
      },
      {
        id: '26.4', title: 'Training the Neural Network', page: 465, level: 'core',
        intuition: `Training adjusts weights to reduce a loss function. Backpropagation computes the gradient; gradient descent takes a step downhill. Repeat over many examples.`,
        detail: `For each training example, the network produces an output, and a loss (e.g., mean-squared error or cross-entropy) measures the discrepancy. Backpropagation applies the chain rule to compute how each weight contributed to the loss. An optimizer—stochastic gradient descent, momentum, Adam—updates the weights by a small step opposite the gradient. The learning rate controls step size: too large and training diverges; too small and it stalls. Epochs are passes through the data; minibatches trade gradient noise for speed. Training can get stuck in poor local minima or plateaus, and it can overfit. The book’s treatment uses a simple feedforward network and gradient descent, but the principles scale to modern deep networks.`,
        formulas: [
          { label: 'Gradient descent', tex: 'w\\leftarrow w-\\eta\\frac{\\partial L}{\\partial w}', vars: 'η = learning rate, L = loss' },
          { label: 'Mean-squared error', tex: 'L=\\frac{1}{N}\\sum_{i=1}^{N}(y_i-\\hat{y}_i)^2', vars: 'Regression loss' },
        ],
        keyPoints: [
          'Backpropagation computes gradients via the chain rule.',
          'Learning rate controls convergence; minibatches add gradient noise.',
          'Training loss is not a measure of generalization.',
        ],
        application: `Classification, regression, system identification, and learned feature extractors.`,
      },
      {
        id: '26.5', title: 'Evaluating the Results', page: 473, level: 'core',
        intuition: `A model is only as good as its performance on data it has never seen. Split the data, validate, and report the right metrics for the task.`,
        detail: `Separate training, validation, and test data. Use validation data to tune hyperparameters and detect overfitting; use the test set only once for a final unbiased estimate. For classification, report a confusion matrix, precision, recall, F1, and ROC/AUC. For detection, report detection probability at a specified false-alarm rate. For regression, report RMSE and examine residuals. Cross-validation is useful when data are scarce. Beware data leakage—using information from the test set during training or preprocessing. The book stresses that a neural network’s output is a statistical estimate, not a proof; domain knowledge and independent validation remain essential.`,
        formulas: [
          { label: 'Precision', tex: '\\text{precision}=\\frac{TP}{TP+FP}', vars: 'Of predicted positives, how many are correct?' },
          { label: 'Recall', tex: '\\text{recall}=\\frac{TP}{TP+FN}', vars: 'Of actual positives, how many were found?' },
        ],
        keyPoints: [
          'Use separate train/validation/test sets.',
          'Choose metrics that reflect the application’s costs.',
          'Watch for data leakage and overfitting.',
        ],
        application: `Medical decision support, fraud detection, predictive maintenance, and quality inspection.`,
      },
      {
        id: '26.6', title: 'Recursive Filter Design', page: 476, level: 'advanced',
        intuition: `Instead of designing a filter from equations, let an optimizer choose its coefficients to minimize an error. Neural networks and other learning methods can do this—if stability is enforced.`,
        detail: `Recursive filter design can be framed as an optimization: choose coefficients that minimize the difference between the desired and realized frequency response (or time response). Gradient-based methods can adjust the coefficients, and a neural network can act as a function approximator that maps specifications to coefficients. The hard part is stability: the optimized filter must keep all poles inside the unit circle. Constraints, parameterizations (e.g., reflection coefficients), or post-design projection can enforce stability. The resulting design may outperform classical methods for unusual specifications, but it can also overfit the training set or produce impractical coefficient magnitudes. The book presents this as an emerging alternative, not a replacement for the classical design methods of Chapters 15–21.`,
        keyPoints: [
          'Filter design can be cast as optimization of coefficients.',
          'Stability constraints (poles inside the unit circle) are essential.',
          'Learned designs need validation on unseen specifications.',
        ],
        caveat: `An optimized filter that is stable in exact arithmetic may be unstable after coefficient quantization. Verify the implemented filter.`,
      },
    ],
    labs: [{
      id: 'neural',
      title: 'Train a perceptron',
      intro: 'Generate two classes of points and train a perceptron. Watch the decision boundary move, then add a hidden layer to solve a nonlinearly separable problem.',
      tasks: [
        'Start with linearly separable classes. How many epochs until the boundary separates them?',
        'Switch to XOR-like classes. Why can a single perceptron never solve this?',
        'Inspect the training versus test accuracy as you increase model capacity. When does overfitting begin?',
      ],
    }],
    worked: {
      title: 'Why a single perceptron cannot solve XOR',
      problem: 'The XOR problem has inputs (0,0)→0, (0,1)→1, (1,0)→1, (1,1)→0. Show that no single linear threshold can classify all four points correctly.',
      steps: [
        { title: 'Assume a linear boundary', text: 'A perceptron computes $w_1x_1+w_2x_2+b$, classifying positive as 1 and negative as 0.' },
        { title: 'Write the constraints', text: 'For (0,0)→0: $b<0$. For (1,0)→1: $w_1+b>0$. For (0,1)→1: $w_2+b>0$. For (1,1)→0: $w_1+w_2+b<0$.' },
        { title: 'Derive a contradiction', text: 'Adding the two positive constraints gives $w_1+w_2+2b>0$. Since $b<0$, this requires $w_1+w_2> -2b>0$. But the negative constraint requires $w_1+w_2<-b$. Combining gives $-b<w_1+w_2<-b$, a contradiction.' },
        { title: 'Add a hidden layer', text: 'A network with a hidden layer can form two linear boundaries and combine them, producing the XOR decision region.' },
      ],
      answer: 'No single linear threshold can separate XOR because the constraints are mutually inconsistent. A hidden layer introduces a nonlinear feature space where the classes become separable.',
    },
    misconceptions: [
      { wrong: 'A neural network can learn anything from any amount of data.', right: 'Capacity is not the only constraint; data quantity, quality, noise, and regularization determine generalization. Small datasets lead to overfitting.' },
      { wrong: 'High training accuracy proves the model works.', right: 'Training accuracy measures fit, not generalization. Always evaluate on held-out data.' },
      { wrong: 'Neural networks replace DSP theory.', right: 'They are a complementary tool. Understanding sampling, convolution, and spectral analysis is still essential for preprocessing, interpretation, and validation.' },
    ],
    takeaways: [
      'Detection combines features, a score, and a threshold; ROC summarizes the tradeoff.',
      'Neural networks stack weighted sums and nonlinear activations to learn features and boundaries.',
      'Universal approximation does not guarantee generalization or successful training.',
      'Train/validation/test discipline and task-appropriate metrics are mandatory.',
      'Filter design can be optimized, but stability must be enforced and verified.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'Why can a single perceptron not solve XOR?',
        options: ['It has too many parameters', 'Its decision boundary is linear, but XOR is not linearly separable', 'It cannot use a bias term', 'It always overfits'],
        answer: 1,
        explanation: 'A perceptron draws a straight line (hyperplane). XOR’s classes cannot be separated by any straight line, so a hidden layer or nonlinear feature is needed.',
        wrongHints: { 0: 'A perceptron has few parameters; the issue is the linear boundary.', 2: 'A bias term shifts the line but does not make it nonlinear.', 3: 'Overfitting is a separate issue; XOR is not even learnable by a single linear unit.' },
      },
      {
        type: 'mcq', question: 'The main purpose of a validation set is to:',
        options: ['increase training speed', 'tune hyperparameters and detect overfitting without touching the test set', 'replace the training set', 'guarantee perfect accuracy'],
        answer: 1,
        explanation: 'Validation data guide model selection. The test set is reserved for a final, unbiased estimate of performance.',
        wrongHints: { 0: 'Validation does not necessarily speed training.', 2: 'It supplements, not replaces, training data.', 3: 'No dataset can guarantee perfect accuracy.' },
      },
      {
        type: 'tf', question: 'Backpropagation uses the chain rule to compute gradients of the loss with respect to network weights.',
        options: ['True', 'False'], answer: 0,
        explanation: 'Backpropagation propagates the loss gradient backward through the network, applying the chain rule layer by layer.',
      },
    ],
  },

  {
    number: 27,
    title: 'Data Compression',
    part: 'Applications',
    tagline: 'Representing information with fewer bits without losing what matters.',
    intro: `Compression is about redundancy and relevance. Lossless methods exploit statistical redundancy so the original can be reconstructed exactly. Lossy methods exploit the limits of human perception or the intended use, discarding detail that will not be missed. Both are central to storage, streaming, communications, and imaging.

This chapter covers compression strategies, run-length encoding, Huffman coding, delta encoding, LZW, JPEG, and MPEG. It explains the algorithms, their assumptions, and the artifacts they produce.`,
    objectives: [
      'Distinguish lossless from lossy compression and entropy from redundancy.',
      'Implement RLE, Huffman, delta, and LZW coding.',
      'Explain the JPEG pipeline and its artifacts.',
      'Describe MPEG’s temporal compression and frame types.',
      'Choose a compression method for a given data type.',
    ],
    prerequisites: [8, 21, 22, 23],
    sections: [
      {
        id: '27.1', title: 'Data Compression Strategies', page: 481, level: 'core',
        intuition: `Compression removes redundancy (repeated patterns) or irrelevance (detail no one will notice). The first is lossless; the second is lossy.`,
        detail: `Lossless compression exploits statistical structure: repeated runs, skewed symbol frequencies, predictable sequences, or dictionary repetitions. The original can be reconstructed bit-for-bit. Lossy compression exploits perceptual limits or a fidelity criterion: quantization, transform coefficient truncation, and motion compensation discard detail while controlling distortion. The rate–distortion curve describes the tradeoff between bit rate and quality. Entropy sets a lower bound on lossless coding for a given symbol distribution. The book emphasizes that the best method depends on the data: text, audio, images, and video have different redundancies. A compressor designed for one type can perform poorly on another.`,
        formulas: [
          { label: 'Entropy', tex: 'H=-\\sum_i p_i\\log_2 p_i', vars: 'Bits per symbol lower bound (lossless)' },
          { label: 'Compression ratio', tex: '\\mathrm{CR}=\\frac{\\text{original size}}{\\text{compressed size}}', vars: 'Higher is better, but quality matters' },
        ],
        keyPoints: [
          'Lossless removes redundancy; lossy removes irrelevance.',
          'Entropy bounds lossless compression.',
          'Match the method to the data type and fidelity requirement.',
        ],
      },
      {
        id: '27.2', title: 'Run-Length Encoding', page: 483, level: 'core',
        intuition: `Instead of storing “AAAAAAA,” store “A×7.” Runs of identical values collapse into a count and a value.`,
        detail: `Run-length encoding (RLE) replaces each run of identical symbols with the symbol and its length. It is extremely effective for images with large flat regions (faxes, icons, simple graphics) and for data with long runs. It can expand random data, because every short run needs a count. Variants use escape codes or pack counts into fixed-width fields. RLE is often used as a final stage after a transform or prediction step that creates many zeros—JPEG uses run-length coding for zero coefficients. The book presents RLE as the simplest lossless compression method and a building block for more sophisticated schemes.`,
        keyPoints: [
          'RLE stores (value, run length) pairs.',
          'Excellent for flat regions and long runs; poor for random data.',
          'Often used after quantization/transform to encode zeros.',
        ],
        application: `Fax, BMP/TIFF variants, and JPEG’s zero-coefficient coding.`,
      },
      {
        id: '27.3', title: 'Huffman Encoding', page: 484, level: 'core',
        intuition: `Give frequent symbols short codes and rare symbols long codes. The codes are prefix-free, so the decoder never needs separators.`,
        detail: `Huffman coding builds a binary tree from symbol frequencies. Repeatedly merge the two least frequent nodes; the resulting tree assigns shorter codes to more frequent symbols. The code is prefix-free: no codeword is a prefix of another, so a bitstream can be decoded unambiguously. The average code length approaches the source entropy; Huffman is optimal among integer-length prefix codes for a known symbol distribution. It requires transmitting or reconstructing the code table, and it does not exploit correlations between symbols—run-length or dictionary methods may do better. The book uses Huffman as the canonical statistical compressor and notes its use in JPEG, MP3, and many file formats.`,
        formulas: [
          { label: 'Average code length', tex: '\\bar{L}=\\sum_i p_i\\,L_i', vars: 'L_i = codeword length for symbol i' },
          { label: 'Prefix-free condition', tex: '\\text{no codeword is a prefix of another}', vars: 'Enables unambiguous decoding' },
        ],
        keyPoints: [
          'Frequent symbols → short codes; rare → long codes.',
          'Prefix-free codes decode without separators.',
          'Huffman is optimal for integer-length prefix codes given known frequencies.',
        ],
        application: `JPEG, MP3, DEFLATE (with LZ77), and general-purpose file compression.`,
      },
      {
        id: '27.4', title: 'Delta Encoding', page: 486, level: 'core',
        intuition: `If consecutive values change slowly, store the changes instead of the values. Small differences need fewer bits.`,
        detail: `Delta encoding stores $d[n]=x[n]-x[n-1]$ (or a higher-order difference) instead of $x[n]$. For smooth signals—audio, images, sensor data—the differences cluster near zero and have lower entropy, so they compress better with Huffman or RLE. Reconstruction is a running sum. Delta encoding is lossless if the differences are represented exactly. It is particularly effective before entropy coding and is used in PNG, TIFF, and audio codecs. The book also discusses predictive coding, where the prediction uses several previous samples; the residual is encoded. The better the predictor, the smaller the residual and the higher the compression.`,
        formulas: [
          { label: 'First difference', tex: 'd[n]=x[n]-x[n-1]', vars: 'Encode d instead of x' },
          { label: 'Reconstruction', tex: 'x[n]=d[n]+x[n-1]', vars: 'Cumulative sum' },
        ],
        keyPoints: [
          'Store differences; reconstruct by cumulative sum.',
          'Effective when adjacent samples are correlated.',
          'Prediction can use more history for smaller residuals.',
        ],
        application: `PNG image filtering, audio coding, sensor telemetry, and time-series storage.`,
      },
      {
        id: '27.5', title: 'LZW Compression', page: 488, level: 'core',
        intuition: `Build a dictionary of repeated phrases as you go. Replace each phrase with a short code—no need to transmit the dictionary separately.`,
        detail: `LZW (Lempel–Ziv–Welch) starts with a dictionary of single symbols. It scans the input, finds the longest phrase already in the dictionary, outputs its code, and adds the phrase plus the next symbol to the dictionary. The decoder reconstructs the dictionary from the codes themselves, so only the codes are transmitted. LZW is lossless and adapts to the data, making it effective for text and repetitive images. It can expand incompressible data, and patent issues historically limited its use (GIF). Modern variants (LZ77/LZ78, DEFLATE) use similar dictionary ideas with different parsing. The book presents LZW as an adaptive dictionary method that requires no prior statistics.`,
        keyPoints: [
          'Adaptive dictionary built during encoding and decoding.',
          'No dictionary transmission required.',
          'Effective for repetitive data; can expand random data.',
        ],
        application: `GIF, TIFF, PDF (LZW variant), and general-purpose compression.`,
      },
      {
        id: '27.6', title: 'JPEG (Transform Compression)', page: 494, level: 'core',
        intuition: `JPEG transforms 8×8 image blocks into frequency coefficients, quantizes the ones the eye won't miss, and entropy-codes the result.`,
        detail: `The JPEG pipeline: convert color to Y’CbCr and subsample chroma; divide the image into 8×8 blocks; subtract 128 and apply the 2-D DCT; quantize each coefficient with a frequency-dependent table; zigzag-scan the coefficients; run-length encode zeros; and Huffman-code the symbols. The DCT concentrates energy into a few low-frequency coefficients, so many high-frequency coefficients quantize to zero. Quality settings scale the quantization table. At high compression, blocking artifacts, ringing (mosquito noise), and color smearing appear. JPEG is lossy and not suitable for images with sharp edges or text at low bitrates. The book explains the transform/quantization/entropy-coding structure that underlies many later codecs.`,
        formulas: [
          { label: '8×8 2-D DCT', tex: 'F[u,v]=\\frac{1}{4}C(u)C(v)\\sum_{x=0}^{7}\\sum_{y=0}^{7}f[x,y]\\cos\\frac{(2x+1)u\\pi}{16}\\cos\\frac{(2y+1)v\\pi}{16}', vars: 'C(0)=1/√2, C(k)=1 otherwise' },
          { label: 'Quantization', tex: '\\hat{F}[u,v]=\\mathrm{round}\\!\\left(\\frac{F[u,v]}{Q[u,v]}\\right)', vars: 'Q = quality-scaled table' },
        ],
        keyPoints: [
          'DCT concentrates energy; quantization discards perceptually minor coefficients.',
          'Zigzag + RLE + Huffman encode the sparse coefficient matrix.',
          'Blocking and ringing are characteristic artifacts at low bitrates.',
        ],
        application: `Photography, web images, medical imaging (with caution), and camera pipelines.`,
      },
      {
        id: '27.7', title: 'MPEG', page: 501, level: 'core',
        intuition: `Video is a sequence of images, but consecutive frames are highly similar. MPEG encodes motion and differences instead of each frame independently.`,
        detail: `MPEG combines spatial compression (DCT/quantization/Huffman, similar to JPEG) with temporal compression. I-frames are coded independently; P-frames predict from a previous frame using motion compensation; B-frames predict from past and future frames. The encoder estimates motion vectors, forms a residual, and codes it. This exploits temporal redundancy and achieves much higher compression than intraframe coding. The tradeoff is complexity, latency, and error propagation: a lost I-frame can corrupt subsequent predictions until the next refresh. MPEG audio layers use perceptual coding with filter banks and psychoacoustic masking. The book presents the core ideas: motion compensation, frame types, and the hybrid transform/prediction structure.`,
        keyPoints: [
          'I-frames independent; P/B frames predicted with motion compensation.',
          'Spatial DCT + temporal prediction gives high compression.',
          'Prediction introduces latency and error propagation.',
        ],
        application: `Broadcast, streaming, Blu-ray, video conferencing, and MPEG audio.`,
      },
    ],
    labs: [{
      id: 'compression',
      title: 'Compress text and images',
      intro: 'Run RLE, Huffman, delta, and LZW on different inputs and compare sizes. Then quantize an 8×8 image block with JPEG and inspect the reconstructed block and coefficient matrix.',
      tasks: [
        'Compress a run-heavy string with RLE and a random string with the same algorithm. Which expands?',
        'Compare Huffman’s average code length with the source entropy.',
        'Lower JPEG quality and identify the first visible artifact: blocking, ringing, or color smearing?',
      ],
    }],
    worked: {
      title: 'Build a Huffman code',
      problem: 'Four symbols have probabilities 0.5, 0.25, 0.125, 0.125. Find a Huffman code and its average length. Compare with the entropy.',
      steps: [
        { title: 'Merge the two least probable', text: 'Merge 0.125 and 0.125 into a node of weight 0.25.' },
        { title: 'Merge again', text: 'Merge the new 0.25 with the existing 0.25 into 0.5.' },
        { title: 'Merge the final two', text: 'Merge 0.5 and 0.5 into the root. Assign 0/1 to each branch.' },
        { title: 'Read the codes', text: 'One valid assignment: 0.5→0, 0.25→10, 0.125→110, 0.125→111. Average length = 0.5(1)+0.25(2)+0.125(3)+0.125(3)=1.75 bits.' },
        { title: 'Compare with entropy', text: '$H=0.5\\log_2 2+0.25\\log_2 4+2(0.125\\log_2 8)=0.5+0.5+0.75=1.75$ bits. The code is optimal for this distribution.' },
      ],
      answer: 'A code such as {0, 10, 110, 111} has average length 1.75 bits, exactly equal to the entropy. Huffman achieves the bound when probabilities are powers of two.',
    },
    misconceptions: [
      { wrong: 'Lossless compression can shrink any file.', right: 'Lossless compression exploits redundancy. Random data may expand because of headers and coding overhead.' },
      { wrong: 'Huffman coding exploits correlations between symbols.', right: 'Standard Huffman codes symbols independently. Run-length, dictionary, or predictive methods exploit correlations.' },
      { wrong: 'Higher JPEG compression always means worse visual quality in the same way.', right: 'Quality depends on content, viewing size, and the quantization table. Some images tolerate aggressive compression; sharp text does not.' },
    ],
    takeaways: [
      'Lossless compression removes redundancy; lossy compression removes irrelevance.',
      'RLE, Huffman, delta, and LZW exploit different kinds of structure.',
      'JPEG = color transform + 8×8 DCT + quantization + zigzag/RLE + Huffman.',
      'MPEG adds motion-compensated temporal prediction to intraframe coding.',
      'Choose a codec by data type, bitrate, latency, and acceptable artifacts.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'Which method is best for a long sequence of identical values?',
        options: ['Huffman coding alone', 'Run-length encoding', 'JPEG', 'MPEG'],
        answer: 1,
        explanation: 'RLE represents the entire run with one value and one count, achieving extreme compression for repeated values.',
        wrongHints: { 0: 'Huffman assigns codes per symbol but still emits one code per symbol unless combined with RLE.', 2: 'JPEG is for images and uses block transforms, not ideal for a 1-D run.', 3: 'MPEG is for video sequences, not a simple run of values.' },
      },
      {
        type: 'mcq', question: 'JPEG’s DCT is applied to:',
        options: ['the entire image at once', '8×8 blocks', 'each color channel’s histogram', 'the motion vectors'],
        answer: 1,
        explanation: 'JPEG divides the image into 8×8 blocks and applies the 2-D DCT to each block independently.',
        wrongHints: { 0: 'A full-image DCT would be expensive and less local; JPEG uses blocks.', 2: 'Histograms are not transformed; pixel blocks are.', 3: 'Motion vectors belong to video codecs such as MPEG.' },
      },
      {
        type: 'tf', question: 'LZW must transmit its dictionary along with the compressed data.',
        options: ['True', 'False'], answer: 1,
        explanation: 'LZW builds the dictionary during encoding and decoding from the same code stream, so the dictionary does not need to be transmitted.',
      },
    ],
  },

  {
    number: 28,
    title: 'Digital Signal Processors',
    part: 'Applications',
    tagline: 'Hardware built around the multiply–accumulate loop.',
    intro: `A general-purpose CPU can run DSP algorithms, but a digital signal processor is optimized for the specific patterns those algorithms repeat: multiply–accumulate, circular buffering, streaming memory access, and real-time deadlines. Understanding the hardware explains why some algorithms are fast and others are not.

This chapter covers the differences between DSPs and general processors, circular buffering, architecture, fixed versus floating point, C versus assembly, speed metrics, and the DSP market. It is a practical bridge between algorithm design and embedded implementation.`,
    objectives: [
      'Explain the architectural features that distinguish a DSP.',
      'Implement circular buffering for delay lines.',
      'Compare fixed-point and floating-point DSP tradeoffs.',
      'Reason about real-time performance and benchmarks.',
      'Choose among DSP, FPGA, GPU, and CPU implementations.',
    ],
    prerequisites: [4, 12, 18],
    sections: [
      {
        id: '28.1', title: 'How DSPs are Different from Other Microprocessors', page: 503, level: 'core',
        intuition: `A DSP is a CPU shaped around one loop: multiply two numbers, add the product to an accumulator, advance to the next sample. Its memory and instruction set make that loop fast.`,
        detail: `DSPs typically include a hardware multiplier and multiply–accumulate (MAC) unit, multiple memory banks and buses (Harvard or modified Harvard architecture), circular addressing for delay lines, zero-overhead loops, bit-reversed addressing for FFTs, and saturating arithmetic. They often have specialized peripherals: serial ports for codecs, DMA controllers, timers, and link ports for inter-processor communication. General-purpose CPUs optimize branchy control code and cache locality; DSPs optimize predictable, streaming arithmetic. Modern CPUs and GPUs have narrowed the gap with SIMD and vector units, but the DSP design point remains low power, deterministic timing, and tight integration with converters.`,
        keyPoints: [
          'MAC, multiple buses, circular addressing, zero-overhead loops, saturation.',
          'Optimized for streaming arithmetic and deterministic real-time behavior.',
          'Modern CPUs/GPUs/FPGAs blur the boundaries; choose by power, latency, and tools.',
        ],
        application: `Hearing aids, noise-canceling headphones, motor drives, radar, and audio receivers.`,
      },
      {
        id: '28.2', title: 'Circular Buffering', page: 506, level: 'core',
        intuition: `A delay line is a ring of memory. New samples overwrite the oldest, and the pointer wraps around. No data shuffling is needed.`,
        detail: `Circular buffering stores the last N samples in a fixed array. A write pointer advances; when it reaches the end, it wraps to the beginning, overwriting the oldest sample. The read pointer for a delay of D samples is offset by D, also modulo N. DSP hardware implements modulo addressing in the address-generation unit, so the wrap costs no extra instructions. This makes FIR filters, echo effects, and recursive filters efficient: the delay line is implicit in the buffer. The book explains the pointer arithmetic and shows how a circular buffer replaces a shift register. Practical issues include buffer size (power of two simplifies wrapping), pointer initialization, and ensuring the read pointer does not overtake uninitialized data.`,
        formulas: [
          { label: 'Next write index', tex: 'p\\leftarrow(p+1)\\bmod N', vars: 'N = buffer length' },
          { label: 'Delayed sample', tex: 'x[n-D]=buf[(p-D)\\bmod N]', vars: 'D = delay in samples' },
        ],
        keyPoints: [
          'Circular buffer = fixed array + wrapping pointers.',
          'Modulo addressing makes delay lines cheap.',
          'Buffer length and pointer initialization must be handled carefully.',
        ],
        application: `FIR/IIR delay lines, echo/reverb, and sliding-window statistics.`,
      },
      {
        id: '28.3', title: 'Architecture of the Digital Signal Processor', page: 509, level: 'support',
        intuition: `A DSP’s datapath is a pipeline: fetch, decode, multiply, accumulate, and write back. Multiple memory buses keep the arithmetic units fed.`,
        detail: `A typical DSP has a program memory bus and one or more data memory buses, allowing an instruction fetch and two data reads in the same cycle. The multiplier and ALU feed an accumulator with extended precision. Pipelining overlaps instruction stages, but it introduces hazards: a result may not be available immediately, and branches can stall the pipeline. DSPs use delay slots, interlocking, and zero-overhead loops to manage this. DMA engines move data between peripherals and memory without CPU involvement. The book describes the architecture of the ADSP-2106x family as an example: multiple internal memory blocks, a dedicated multiplier, a barrel shifter, and serial/link ports.`,
        keyPoints: [
          'Multiple buses feed the MAC; pipelining overlaps operations.',
          'Hazards and branches can stall the pipeline.',
          'DMA and specialized peripherals reduce CPU overhead.',
        ],
        application: `Real-time audio, motor control, and communications basebands.`,
      },
      {
        id: '28.4', title: 'Fixed versus Floating Point', page: 514, level: 'core',
        intuition: `Fixed point is fast, cheap, and power-efficient but requires manual scaling. Floating point is easier to program and has huge dynamic range, but costs more silicon and power.`,
        detail: `Fixed-point DSPs use integer arithmetic with an implied binary point. They are efficient because the multiplier is smaller and the datapath narrower, but the programmer must manage scaling, headroom, and quantization. Floating-point DSPs handle a wide dynamic range automatically, simplifying development and improving robustness for algorithms with large intermediate values. The tradeoff is cost, power, and sometimes speed. Many audio and control applications use 16-bit or 24-bit fixed point; high-end audio, radar, and scientific instruments often use 32-bit floating point. Block floating point—a shared exponent for a block of values—offers a middle ground. The book’s ADSP-2106x is a 32-bit floating-point DSP with extended-precision accumulation.`,
        keyPoints: [
          'Fixed point: cheap, fast, low power, manual scaling.',
          'Floating point: wide dynamic range, easier development, higher cost.',
          'Block floating point is a compromise for FFTs and arrays.',
        ],
        application: `Fixed point in mass-market audio/control; floating point in instrumentation and high-dynamic-range systems.`,
      },
      {
        id: '28.5', title: 'C versus Assembly', page: 520, level: 'support',
        intuition: `C is portable and maintainable; assembly can be faster and gives direct control of hardware features. Most DSP code is a hybrid.`,
        detail: `Compilers for DSPs have improved dramatically, but hand-written assembly or intrinsics can still win in inner loops by using circular addressing, dual MACs, and delay slots efficiently. C is preferred for control logic, user interfaces, and maintainability. The book presents assembly examples to show what the hardware can do, not to argue that all DSP code should be assembly. Modern practice uses C/C++ with intrinsics, pragmas, and optimized libraries, reserving assembly for hot loops. Profiling is essential: optimizing the wrong loop wastes effort. Numerical behavior can differ between C and assembly due to saturation, rounding, and accumulator width.`,
        keyPoints: [
          'C for portability and maintainability; assembly/intrinsics for hot loops.',
          'Profile before optimizing; the inner loop dominates.',
          'Check numerical differences between compiler output and hand code.',
        ],
      },
      {
        id: '28.6', title: 'How Fast are DSPs?', page: 526, level: 'support',
        intuition: `Clock rate is not performance. What matters is how many multiply–accumulates per second the datapath can sustain, and whether memory can feed it.`,
        detail: `DSP performance is often quoted in MIPS (million instructions per second) or MMACs (million multiply–accumulates per second). A 100 MHz DSP with a single-cycle MAC can do 100 MMAC/s; dual-MAC architectures double that. But real algorithms also need memory loads, stores, and loop overhead, so achievable performance is lower than the peak. Benchmarks such as FIR filters, FFTs, and IIR filters are more informative than clock rate. Real-time constraints add another dimension: the system must finish each sample or block before the next deadline. Latency, jitter, and interrupt overhead matter as much as average throughput. The book emphasizes measuring the actual algorithm on the actual hardware.`,
        formulas: [
          { label: 'Real-time sample budget', tex: 'T_{\\mathrm{budget}}=\\frac{1}{f_s}', vars: 'e.g., 20.8 µs at 48 kHz' },
          { label: 'Peak MAC rate', tex: 'R_{\\mathrm{MAC}}=f_{\\mathrm{clk}}\\times N_{\\mathrm{MAC}}', vars: 'N_MAC = MAC units per cycle' },
        ],
        keyPoints: [
          'MIPS/MMAC are peak numbers; real throughput includes memory and overhead.',
          'Real-time systems have a hard per-sample or per-block deadline.',
          'Benchmark the actual algorithm, not just the clock rate.',
        ],
      },
      {
        id: '28.7', title: 'The Digital Signal Processor Market', page: 531, level: 'support',
        intuition: `DSPs compete with general-purpose CPUs, FPGAs, GPUs, and custom ASICs. The right choice depends on volume, power, latency, flexibility, and tools.`,
        detail: `The DSP market spans audio, communications, automotive, industrial, and medical applications. Selection criteria include arithmetic performance, power consumption, memory, peripherals, development tools, cost at volume, and long-term availability. FPGAs offer massive parallelism and custom datapaths but are harder to program and less power-efficient for some workloads. GPUs excel at throughput-oriented parallel processing but have higher latency and power. General-purpose CPUs with SIMD are increasingly capable. ASICs offer the best efficiency at high volume but enormous design cost. The book, written in the late 1990s, focuses on the SHARC/ADSP-2106x family, but the tradeoff framework remains valid.`,
        keyPoints: [
          'Choose by performance, power, latency, cost, tools, and volume.',
          'FPGAs for custom parallelism; GPUs for throughput; ASICs for volume efficiency.',
          'Ecosystem and long-term support matter as much as peak specs.',
        ],
        application: `Product architecture decisions in audio, automotive radar, industrial control, and medical devices.`,
      },
    ],
    labs: [{
      id: 'dsp-hardware',
      title: 'Circular buffers and the MAC loop',
      intro: 'Step a circular buffer through writes and reads, then inspect a FIR inner loop. Compare the cost of direct convolution with a MAC-accelerated implementation.',
      tasks: [
        'Write eight samples into a 4-element buffer. Which values remain, and where is the pointer?',
        'Set a delay of 2 samples and read the delayed value. Verify the modulo arithmetic.',
        'Estimate the real-time sample budget at 48 kHz and compare with the loop cost.',
      ],
    }],
    worked: {
      title: 'Can this DSP run the filter in real time?',
      problem: 'A 48 kHz audio system needs a 256-tap FIR filter. A DSP runs at 120 MHz with one MAC per cycle and can sustain one MAC per instruction with no memory stalls. Can it keep up?',
      steps: [
        { title: 'Compute the per-sample budget', text: '$1/48{,}000\\approx20.8\\ \\mu\\mathrm{s}$ per sample.' },
        { title: 'Compute the filter cost', text: '256 MACs per sample. At 120 MHz, one MAC per cycle takes $256/120\\times10^6\\approx2.13\\ \\mu\\mathrm{s}$.' },
        { title: 'Compare with the budget', text: '$2.13\\ \\mu\\mathrm{s}<20.8\\ \\mu\\mathrm{s}$, so the filter uses about 10% of the CPU.' },
        { title: 'Account for overhead', text: 'Add loads, stores, loop control, and other tasks. Even with 2–3× overhead, the filter fits comfortably. A 1024-tap filter would use about 40% before overhead—still feasible, but tighter.' },
      ],
      answer: 'Yes. The 256-tap FIR needs about 2.1 µs per sample versus a 20.8 µs budget. A 1024-tap filter would need about 8.5 µs, leaving less headroom for other processing.',
    },
    misconceptions: [
      { wrong: 'A higher clock rate always means a faster DSP for your algorithm.', right: 'Memory bandwidth, MAC width, addressing modes, and pipeline stalls can dominate. Benchmark the actual algorithm.' },
      { wrong: 'Floating point is always better because it avoids overflow.', right: 'Floating point has wider range but costs power, silicon, and sometimes speed. Fixed point with careful scaling can be more efficient.' },
      { wrong: 'Circular buffering requires copying data to shift the delay line.', right: 'The pointer wraps around the buffer; no data shuffling is needed. That is the point of circular addressing.' },
    ],
    takeaways: [
      'DSPs optimize the MAC/streaming loop with multiple buses, circular addressing, and zero-overhead loops.',
      'Circular buffers implement delay lines with modulo pointers.',
      'Fixed point is efficient but needs scaling; floating point is easier but costlier.',
      'Real-time performance is a deadline problem, not just a throughput problem.',
      'Select hardware by the whole system: performance, power, latency, tools, and cost.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'The main advantage of circular buffering is that it:',
        options: ['increases the clock speed', 'implements a delay line without shifting data', 'eliminates quantization noise', 'makes the filter linear phase'],
        answer: 1,
        explanation: 'A circular buffer overwrites the oldest sample and wraps the pointer, so no data needs to be shifted through memory.',
        wrongHints: { 0: 'Clock speed is a hardware property, not a consequence of buffering.', 2: 'Quantization noise is set by word length, not buffer organization.', 3: 'Phase linearity depends on the filter coefficients, not the buffer.' },
      },
      {
        type: 'mcq', question: 'At 48 kHz, the real-time budget per sample is about:',
        options: ['2.08 µs', '20.8 µs', '208 µs', '48 µs'],
        answer: 1,
        explanation: '$1/48{,}000=20.83\\ \\mu$s. All processing for one sample must finish within this period for hard real-time operation.',
        wrongHints: { 0: 'That would be 480 kHz.', 2: 'That would be 4.8 kHz.', 3: '48 µs corresponds to about 20.8 kHz.' },
      },
      {
        type: 'tf', question: 'A DSP’s peak MMAC rating guarantees that a real FIR filter will achieve that throughput.',
        options: ['True', 'False'], answer: 1,
        explanation: 'Peak throughput assumes ideal conditions. Memory access, loop overhead, and pipeline stalls reduce achievable performance; benchmark the actual filter.',
      },
    ],
  },

  {
    number: 29,
    title: 'Getting Started with DSPs',
    part: 'Applications',
    tagline: 'From datasheet to a working real-time audio filter.',
    intro: `A DSP algorithm becomes useful only when it runs on hardware, in real time, with real converters. This chapter walks through a concrete development path: the ADSP-2106x family, the SHARC EZ-KIT Lite board, a FIR audio-filter design example, analog measurements, fixed-versus-floating-point considerations, and advanced software tools.

The details are specific to an earlier generation of hardware, but the workflow is timeless: understand the architecture, set up the toolchain, implement a small real-time kernel, measure the analog output, and verify performance with instruments.`,
    objectives: [
      'Describe the ADSP-2106x/SHARC architecture at a high level.',
      'Set up a DSP development board and toolchain.',
      'Implement a real-time FIR audio filter with circular buffering.',
      'Measure analog performance and interpret the results.',
      'Choose fixed or floating point for an application.',
    ],
    prerequisites: [16, 28],
    sections: [
      {
        id: '29.1', title: 'The ADSP-2106x family', page: 535, level: 'support',
        intuition: `The ADSP-2106x is a 32-bit floating-point DSP family designed for high-performance audio, communications, and instrumentation. It combines a fast core, on-chip memory, and specialized peripherals.`,
        detail: `The SHARC (Super Harvard Architecture Computer) family uses a 32-bit floating-point core with 40-bit extended-precision accumulation, a dual-ported memory architecture, and multiple internal memory blocks. It includes serial ports for audio codecs, link ports for inter-processor communication, DMA channels, timers, and external memory interfaces. The instruction set supports SIMD-style parallel operations, circular addressing, and bit-reversed addressing for FFTs. The 2106x variants differ in on-chip memory and peripherals. The book presents the family as an example of how DSP hardware integrates computation, memory, and I/O for real-time signal processing. Exact clock rates and memory sizes vary by part and are best taken from the datasheet.`,
        keyPoints: [
          '32-bit floating-point core with extended-precision accumulation.',
          'Multiple memory blocks, serial/link ports, DMA, and timers.',
          'Circular and bit-reversed addressing support filters and FFTs.',
        ],
        application: `Professional audio, sonar, radar, and industrial instrumentation.`,
      },
      {
        id: '29.2', title: 'The SHARC EZ-KIT Lite', page: 537, level: 'support',
        intuition: `A development board gives you the DSP, converters, memory, and connectors needed to run real code without designing hardware first.`,
        detail: `The EZ-KIT Lite is a low-cost evaluation board with a SHARC DSP, an audio codec (ADC/DAC), memory, and a host interface for programming and debugging. It typically includes a C compiler, assembler, linker, debugger, and example programs. The workflow is: install the tools, connect the board, build a project, download the executable, and run it. The board’s analog input/output lets you hear and measure the result immediately. The book uses the EZ-KIT to demonstrate a complete FIR audio filter, from coefficient generation to real-time execution. Modern equivalents include evaluation boards from many vendors, but the development pattern is the same.`,
        keyPoints: [
          'Evaluation board = DSP + codec + memory + host interface.',
          'Toolchain: compiler, assembler, linker, debugger, examples.',
          'Immediate analog I/O makes audio DSP easy to test.',
        ],
        application: `Prototyping, teaching, and validating DSP algorithms before custom hardware.`,
      },
      {
        id: '29.3', title: 'Design Example: An FIR Audio Filter', page: 538, level: 'core',
        intuition: `The design example ties everything together: generate a windowed-sinc kernel, store it in memory, stream samples through a circular buffer, and compute one output per sample in real time.`,
        detail: `The FIR audio filter example uses a windowed-sinc low-pass kernel, a circular input buffer, and a multiply–accumulate loop. At each sample interrupt, the code reads a new ADC sample, writes it into the buffer, computes the dot product of the buffer with the coefficients, and writes the result to the DAC. The sample rate and kernel length determine the CPU load. Coefficients are often generated in a high-level language (MATLAB, Python, C) and stored as a header file or loaded from memory. The example demonstrates real-time constraints, circular addressing, and the importance of testing with actual audio. It also shows how to verify the filter’s frequency response using a signal generator and spectrum analyzer.`,
        formulas: [
          { label: 'Real-time FIR', tex: 'y[n]=\\sum_{k=0}^{M-1}h[k]\\,x[n-k]', vars: 'One output per sample interrupt' },
        ],
        keyPoints: [
          'Generate coefficients offline; implement the dot product online.',
          'Circular buffer holds the last M input samples.',
          'Sample interrupt deadline determines the maximum kernel length.',
        ],
        application: `Audio tone controls, anti-alias filters, and real-time equalizers.`,
      },
      {
        id: '29.4', title: 'Analog measurements on a DSP system', page: 542, level: 'core',
        intuition: `A working program is not a working system. Measure the analog output: noise, distortion, frequency response, and latency.`,
        detail: `To validate a DSP audio system, drive the input with a known signal (sine sweep, impulse, white noise) and measure the output with an oscilloscope, spectrum analyzer, or audio analyzer. Check passband flatness, stopband attenuation, total harmonic distortion plus noise (THD+N), signal-to-noise ratio, and latency. The DAC’s reconstruction filter and the ADC’s anti-alias filter are part of the measured response. Clock jitter and grounding can introduce noise that no amount of digital processing removes. Compare the measured response with the designed response and investigate discrepancies. The book emphasizes that analog measurements close the loop between theory and reality.`,
        keyPoints: [
          'Measure frequency response, THD+N, SNR, and latency.',
          'Converters and analog filters are part of the system response.',
          'Grounding, clocks, and jitter can dominate measured noise.',
        ],
        application: `Audio product validation, amplifier testing, and embedded system bring-up.`,
      },
      {
        id: '29.5', title: 'Another Look at Fixed versus Floating Point', page: 544, level: 'core',
        intuition: `The SHARC’s floating-point core makes development easier, but fixed-point DSPs can be cheaper and more power-efficient. The right choice depends on the algorithm’s dynamic range and the product’s constraints.`,
        detail: `Floating-point DSPs simplify scaling and handle wide dynamic range, which is valuable for algorithms with large intermediate values, adaptive filters, and high-order recursions. Fixed-point DSPs require the programmer to analyze signal ranges, choose Q formats, and insert scaling shifts, but they can be smaller, cheaper, and lower power. The book compares the two for audio: 32-bit floating point gives ample headroom and precision; 24-bit fixed point is often sufficient for playback; 16-bit fixed point may suffice for voice. Block floating point can extend range without a full floating-point unit. The decision should be based on measured requirements, not habit.`,
        keyPoints: [
          'Floating point: easier scaling, wide range, higher cost/power.',
          'Fixed point: efficient, but requires range analysis and scaling.',
          'Match word length and format to the required dynamic range and precision.',
        ],
      },
      {
        id: '29.6', title: 'Advanced Software Tools', page: 546, level: 'support',
        intuition: `Modern DSP development relies on compilers, libraries, simulators, profilers, and real-time operating systems. Good tools can matter as much as the chip.`,
        detail: `Toolchains include optimizing C/C++ compilers, intrinsic libraries for SIMD/MAC operations, DSP libraries for FFTs and filters, simulators for algorithm development without hardware, and debuggers with real-time trace. Profilers identify hot loops; static analyzers catch numerical and memory issues. Real-time operating systems schedule audio blocks and manage peripherals. Model-based design tools generate code from block diagrams. The book’s VisualDSP++ environment is an early example; modern equivalents include vendor IDEs and open-source toolchains. The key is to use the tools to measure and verify, not just to build.`,
        keyPoints: [
          'Compilers, optimized libraries, simulators, profilers, and RTOS support.',
          'Profile to find hot loops; verify numerical behavior on target.',
          'Model-based tools can generate optimized code from diagrams.',
        ],
        application: `Professional embedded DSP development and rapid prototyping.`,
      },
    ],
    labs: [{
      id: 'fir-real-time',
      title: 'Size a real-time FIR audio filter',
      intro: 'Choose the tap count, cutoff, sample rate, and clock. The magnitude response shows what the filter does; the utilization plot shows whether it can finish before the next sample deadline.',
      tasks: [
        'Set a 48 kHz sample rate and 128 taps. Does the simulated DSP keep up?',
        'Increase the tap count until the deadline is missed. What is the maximum feasible length?',
        'Convert the group delay to milliseconds. Is it acceptable for live monitoring?',
      ],
    }],
    worked: {
      title: 'Size a real-time audio filter',
      problem: 'A DSP runs at 100 MHz with one MAC per cycle. It must process stereo audio at 48 kHz with a 128-tap FIR per channel. What fraction of the CPU does the filtering use, ignoring overhead?',
      steps: [
        { title: 'Compute MACs per second', text: 'Two channels × 48,000 samples/s × 128 taps = 12,288,000 MAC/s.' },
        { title: 'Compare with clock rate', text: 'At 100 MHz and one MAC/cycle, the CPU can do 100,000,000 MAC/s.' },
        { title: 'Compute utilization', text: '$12.288/100=0.1229$, about 12.3% of peak.' },
        { title: 'Add overhead', text: 'Loads, stores, loop control, and interrupts may double or triple the cost. Even at 3× overhead, the filter uses about 37%—feasible, but leave room for other processing.' },
      ],
      answer: 'About 12% of peak before overhead, perhaps 25–37% with realistic overhead. The design fits, but a 512-tap stereo filter would be much tighter.',
    },
    misconceptions: [
      { wrong: 'A development board is only for beginners.', right: 'Evaluation boards are standard tools for prototyping, benchmarking, and validating algorithms before custom hardware.' },
      { wrong: 'If the code runs, the DSP system works.', right: 'Analog performance, clocking, grounding, and converter behavior can still fail. Measure the output.' },
      { wrong: 'Floating point is always the safer choice.', right: 'It simplifies scaling but costs power and money. Fixed point can be the right choice when the dynamic range is understood.' },
    ],
    takeaways: [
      'The ADSP-2106x/SHARC integrates a floating-point core, memory, and audio-oriented peripherals.',
      'Evaluation boards and toolchains shorten the path from algorithm to real-time system.',
      'A real-time FIR combines offline coefficient design with an online circular-buffer MAC loop.',
      'Analog measurements are essential; digital correctness does not guarantee analog quality.',
      'Choose fixed or floating point from measured dynamic-range and cost requirements.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'In a real-time FIR audio filter, the circular buffer stores:',
        options: ['the filter coefficients', 'the most recent input samples', 'the FFT twiddle factors', 'the output spectrum'],
        answer: 1,
        explanation: 'The circular buffer holds the last M input samples so the dot product can access x[n−k] without shifting data.',
        wrongHints: { 0: 'Coefficients are usually stored separately in a fixed array.', 2: 'Twiddle factors belong to FFTs, not FIR filtering.', 3: 'The output spectrum is not stored for a time-domain FIR.' },
      },
      {
        type: 'mcq', question: 'At 48 kHz stereo with 128 taps per channel and one MAC per cycle at 100 MHz, the filtering uses about:',
        options: ['1.2%', '12%', '50%', '100%'],
        answer: 1,
        explanation: '2×48,000×128 = 12.288M MAC/s; divided by 100M MAC/s ≈ 12.3%.',
        wrongHints: { 0: '1.2% would be 10× fewer MACs.', 2: '50% would require about 50M MAC/s.', 3: '100% would require the full clock rate for MACs alone.' },
      },
      {
        type: 'tf', question: 'A correct DSP program guarantees correct analog output.',
        options: ['True', 'False'], answer: 1,
        explanation: 'Converters, reconstruction filters, clocks, grounding, and analog noise all affect the output. Measure the analog signal to verify the system.',
      },
    ],
  },
];
