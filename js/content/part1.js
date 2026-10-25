/**
 * Part I — Foundations (chapters 1–4)
 * Source: Smith, The Scientist and Engineer's Guide to DSP, 2nd ed.
 * Every section id matches js/data/source_index.js.
 */

export const part1 = [
  {
    number: 1,
    title: 'The Breadth and Depth of DSP',
    part: 'Foundations',
    tagline: 'What digital signal processing is, and why it changed science and engineering.',
    intro: `Digital signal processing (DSP) is the mathematics, algorithms, and techniques used to manipulate signals after they have been converted into digital form. A signal is a description of how a physical quantity varies—sound pressure at a microphone, light intensity across a camera sensor, voltage across an electrode, or the reflection of a radar pulse. Once that description becomes a sequence of numbers, DSP answers the question: *what next?*

The subject is broad because the same tools—sampling, convolution, Fourier analysis, filtering, compression—reappear in communications, audio, medical imaging, radar, sonar, and geology. It is deep because each field adds its own constraints and algorithms. This chapter builds the map; the rest of the course fills in the territory.`,
    objectives: [
      'Define DSP, signal, and the analog-to-digital boundary.',
      'Recognize the four historical root areas of DSP.',
      'Explain how the same DSP principles appear in communications, audio, echo location, and imaging.',
      'Describe the standard signal chain from sensor to digital output.',
    ],
    prerequisites: [],
    sections: [
      {
        id: '1.1', title: 'The Roots of DSP', page: 1, level: 'core',
        intuition: `DSP begins where a physical signal has been turned into numbers. Its history is not abstract mathematics for its own sake: it grew where the payoff for extracting information from noisy measurements was enormous.`,
        detail: `The book traces DSP's early development to the 1960s and 1970s, when digital computers first became widely available but were still expensive. Four areas justified the cost: radar and sonar, where national security depended on detecting weak echoes; oil exploration, where seismic reflections could reveal underground structures; space exploration, where telemetry had to survive noisy, distant links; and medical imaging, where signals from X-rays, ultrasound, or nuclear tracers had to be reconstructed into images. In each case, the raw data were noisy, indirect, and voluminous. DSP supplied the algorithms that turned measurements into usable information.`,
        keyPoints: [
          'DSP manipulates signals *after* digitization; the sensor and ADC are part of the wider signal chain.',
          'The field grew where computation was expensive and information was valuable.',
          'Radar/sonar, oil exploration, space exploration, and medical imaging are the historical roots.',
        ],
        caveat: `DSP cannot recover information that was never captured. If an analog signal is badly sampled or clipped before conversion, later processing cannot undo the loss.`,
        application: `A modern phone contains dozens of DSP blocks: microphone beamforming, noise suppression, echo cancellation, speech coding, radio modulation, and image processing.`,
      },
      {
        id: '1.2', title: 'Telecommunications', page: 4, level: 'support',
        intuition: `A communication link is a race between signal and noise. DSP is the set of techniques that packs more information into a limited bandwidth and then recovers it reliably.`,
        detail: `In telecommunications, DSP performs modulation and demodulation, filtering, equalization, error correction, and compression. The book emphasizes that digital techniques allow complex modulation formats and adaptive receivers that would be difficult or impossible to build with analog circuits alone. A modem, for example, can shape pulses, cancel echoes, and estimate the communication channel digitally. The same arithmetic that filters a seismic trace can separate channels in a cellular radio.`,
        keyPoints: [
          'DSP enables bandwidth-efficient modulation and robust detection.',
          'Adaptive equalization and echo cancellation compensate for real channels.',
          'Compression reduces the bits needed for storage and transmission.',
        ],
        application: `Wi-Fi, 4G/5G, DSL, and deep-space telemetry all rely on digital pulse shaping, synchronization, and error-correcting codes.`,
      },
      {
        id: '1.3', title: 'Audio Processing', page: 5, level: 'support',
        intuition: `Audio is the most familiar DSP application: every streamed song, phone call, and hearing aid is a chain of digital filters and transforms.`,
        detail: `Audio DSP includes noise reduction, equalization, artificial reverberation, pitch shifting, speech recognition and synthesis, and perceptual compression. The book uses audio to make an important distinction: information can be encoded in the *frequency content* of a signal rather than in its exact waveform shape. Two audio signals that look completely different on an oscilloscope can sound identical if their frequency components have the same amplitudes, even when their phases differ. That fact motivates the Fourier transform and explains why some filters can distort a waveform without damaging what we hear.`,
        keyPoints: [
          'Audio information is largely frequency-domain: amplitude versus frequency matters more than waveform shape.',
          'Perceptual coding discards detail the ear will not notice.',
          'Sampling rate and bit depth jointly set audio bandwidth and noise floor.',
        ],
        caveat: `Phase still matters for transient sounds and for multi-channel reproduction; “inaudible phase” is a useful approximation, not a universal law.`,
      },
      {
        id: '1.4', title: 'Echo Location', page: 7, level: 'support',
        intuition: `Radar, sonar, and ultrasound infer distance by sending a pulse and listening for its echo. The longer the wait, the farther the object.`,
        detail: `An echo-location system transmits a known pulse, receives a delayed and attenuated copy, and estimates the delay. For a wave traveling at speed $c$, a round trip to a target at range $R$ takes $t=2R/c$, so $R=ct/2$. The book notes that the received echo is usually buried in noise, so DSP uses correlation (matched filtering) to find the delay that best aligns the received signal with the transmitted pulse. Doppler shifts in the echo also reveal target motion. The same principles apply to medical ultrasound, fish finders, and seismic reflection.`,
        formulas: [
          { label: 'Round-trip range', tex: 'R = \\frac{c\\,t}{2}', vars: 'R = range, c = wave speed, t = echo delay' },
        ],
        keyPoints: [
          'Range is inferred from echo delay, not from echo amplitude.',
          'Matched filtering/correlation concentrates a weak echo and estimates its delay.',
          'Doppler shift carries velocity information.',
        ],
        application: `Weather radar, airport surveillance, sonar, medical ultrasound, and automotive radar all use variants of this chain.`,
      },
      {
        id: '1.5', title: 'Image Processing', page: 9, level: 'support',
        intuition: `An image is a signal sampled over space instead of time. The same convolution and Fourier tools apply, with two-dimensional kernels and spectra.`,
        detail: `Image processing uses DSP to enhance, restore, compress, segment, and understand pictures. The book points to medical imaging—CT, MRI, ultrasound—as a dramatic example: a CT scanner measures X-ray attenuation along many directions and reconstructs a cross-section computationally. Image enhancement uses convolution kernels for blurring, sharpening, and edge detection; compression exploits spatial redundancy and the limits of human vision. The key conceptual move is to treat brightness as a function of two coordinates, $f(x,y)$, and to replace time-domain filters with two-dimensional ones.`,
        keyPoints: [
          'Images are two-dimensional signals; convolution and Fourier analysis extend directly.',
          'CT and MRI are computational reconstructions, not direct photographs.',
          'Human perception guides lossy image compression.',
        ],
        application: `Photo denoising, medical scanners, satellite remote sensing, and machine vision all depend on digital image processing.`,
      },
    ],
    labs: [{
      id: 'pipeline',
      title: 'The signal chain, end to end',
      intro: 'Follow a real-world signal from the sensor through sampling, digital filtering, and back to an analog output. Switch applications and inject noise to see why each block exists.',
      tasks: [
        'Choose the audio application and raise the noise slider. Which block removes most of the hiss?',
        'Switch to radar. Observe how the echo is delayed and attenuated; relate the delay to range.',
        'Turn the anti-alias filter off and raise the input frequency above half the sampling rate. What happens to the recovered waveform?',
      ],
    }],
    worked: {
      title: 'How far away is the target?',
      problem: 'A sonar system emits a pulse and receives an echo 0.24 s later. The speed of sound in seawater is about 1500 m/s. How far away is the reflector?',
      steps: [
        { title: 'Identify the travel path', text: 'The pulse travels to the target and back, so the sound covers twice the range in 0.24 s.' },
        { title: 'Apply the round-trip relation', text: 'Use $R = c t / 2$ with $c=1500\\ \\mathrm{m/s}$ and $t=0.24\\ \\mathrm{s}$.' },
        { title: 'Compute', text: '$R = (1500)(0.24)/2 = 180\\ \\mathrm{m}$.' },
      ],
      answer: 'The reflector is 180 m away. If you forgot the factor of two, you would report 360 m—the total path length, not the range.',
    },
    misconceptions: [
      { wrong: 'DSP is just programming a computer to handle audio.', right: 'DSP is a body of signal theory and algorithms; audio is only one application. The same convolution and Fourier tools serve radar, imaging, and communications.' },
      { wrong: 'Once data are digital, processing can recover anything.', right: 'Digitization imposes hard limits: aliasing, quantization, and clipping destroy information before software sees it.' },
    ],
    takeaways: [
      'DSP is the manipulation of signals after digitization, spanning analysis, filtering, compression, and reconstruction.',
      'The field is application-broad but conceptually unified by sampling, linear systems, convolution, and Fourier methods.',
      'The sensor–ADC–DSP–DAC chain, and its physical limits, frames every later chapter.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'Which sequence best describes a typical DSP signal chain?',
        options: ['Digital filter → sensor → ADC → display', 'Sensor → anti-alias filter → ADC → DSP → DAC → reconstruction filter', 'DAC → DSP → ADC → sensor', 'Sensor → DSP → ADC → anti-alias filter'],
        answer: 1,
        explanation: 'The physical signal is band-limited before sampling, digitized, processed, converted back to analog, and smoothed by a reconstruction filter.',
        wrongHints: { 0: 'Processing cannot precede acquisition.', 2: 'The DAC is an output device, not the first block.', 3: 'DSP operates on digital samples, so it must follow the ADC.' },
      },
      {
        type: 'mcq', question: 'A radar echo returns after 20 µs. Taking the speed of light as $3\\times10^8$ m/s, what is the target range?',
        options: ['6 km', '3 km', '600 m', '1.5 km'],
        answer: 1,
        explanation: '$R=ct/2=(3\\times10^8)(20\\times10^{-6})/2=3000$ m = 3 km. The factor of two accounts for the outbound and return path.',
        wrongHints: { 0: '6 km is the total path length, not the one-way range.', 2: 'Check the exponent: 20 µs is $20\\times10^{-6}$ s.', 3: 'This uses a one-way travel time of 10 µs, but the measured delay is round-trip.' },
      },
      {
        type: 'tf', question: 'Audio information is always encoded only in the exact waveform shape, so changing phase always changes what we hear.',
        options: ['True', 'False'], answer: 1,
        explanation: 'For many steady sounds, the ear is relatively insensitive to phase; frequency content dominates. Phase can matter for transients and spatial perception, but the blanket statement is false.',
      },
    ],
  },

  {
    number: 2,
    title: 'Statistics, Probability and Noise',
    part: 'Foundations',
    tagline: 'Describing random signals without being fooled by a single measurement.',
    intro: `Real signals are contaminated by randomness. A single recorded waveform is one realization of an underlying process; its mean, spread, histogram, and spectrum are estimates, not eternal truths. This chapter builds the statistical vocabulary DSP uses to separate signal from noise.

The central distinction is between a *signal*—the particular numbers you measured—and the *process* that generated them. A noisy measurement can look wild while the process behind it is stable and well described by a probability density. Understanding that difference is what lets you design filters and detectors that generalize beyond one lucky recording.`,
    objectives: [
      'Read signal graphs and distinguish continuous from discrete notation.',
      'Compute and interpret mean, standard deviation, histograms, pmf, and pdf.',
      'Explain the normal distribution and the central limit theorem.',
      'Generate uniform and Gaussian noise digitally.',
      'Distinguish precision from accuracy.',
    ],
    prerequisites: [1],
    sections: [
      {
        id: '2.1', title: 'Signal and Graph Terminology', page: 11, level: 'core',
        intuition: `A signal is a quantity that carries information as it varies. A graph is one way to see that variation; the numbers behind the graph are what DSP actually processes.`,
        detail: `The book writes a continuous signal as $x(t)$ and a discrete signal as $x[n]$, where $n$ is an integer sample number. The amplitude is the value at a given time or sample. In a discrete signal, nothing is defined between samples unless we adopt a reconstruction rule. This matters: joining sample points with straight lines is a visualization convenience, not evidence about what happened between them. Signals may be one-dimensional (audio), two-dimensional (images), or higher-dimensional (volumetric data). DSP notation consistently separates the independent variable (time, space, sample index) from the dependent amplitude.`,
        formulas: [
          { label: 'Continuous vs. discrete', tex: 'x(t),\\quad t\\in\\mathbb{R}\\qquad\\longleftrightarrow\\qquad x[n],\\quad n\\in\\mathbb{Z}', vars: 't = continuous time; n = integer sample index' },
        ],
        keyPoints: [
          'Square brackets signal a discrete sequence; parentheses signal a continuous function.',
          'Samples are defined only at integer indices.',
          'Lines drawn between samples are interpolation, not measured data.',
        ],
        caveat: `The same word “signal” can mean the physical quantity or its numerical representation. Keep track of which one a statement refers to.`,
      },
      {
        id: '2.2', title: 'Mean and Standard Deviation', page: 13, level: 'core',
        intuition: `The mean locates the center of a signal; the standard deviation says how far values typically stray from that center. Together they summarize a large data set with two numbers.`,
        detail: `For $N$ samples, the book defines the mean as the sum divided by $N$, and the standard deviation as the square root of the average squared deviation from the mean. The standard deviation is the root-mean-square (RMS) value of the AC part of the signal: subtract the DC component, then take the RMS. A useful identity is $\\sigma^2 = \\overline{x^2} - \\mu^2$. The book uses the population form with divisor $N$; in inferential statistics a sample form with $N-1$ is common, but for describing a complete recorded signal the $N$ form is appropriate.`,
        formulas: [
          { label: 'Mean', tex: '\\mu = \\frac{1}{N}\\sum_{n=0}^{N-1} x[n]', vars: 'N = number of samples' },
          { label: 'Standard deviation', tex: '\\sigma = \\sqrt{\\frac{1}{N}\\sum_{n=0}^{N-1}(x[n]-\\mu)^2}', vars: 'σ = RMS deviation from the mean' },
          { label: 'Computational identity', tex: '\\sigma^2 = \\frac{1}{N}\\sum x[n]^2 - \\mu^2', vars: 'Useful for one-pass calculation' },
        ],
        keyPoints: [
          'Mean = DC level; standard deviation = RMS of the AC component.',
          'Standard deviation is never negative; variance is its square.',
          'Both are sensitive to outliers, especially the standard deviation.',
        ],
        application: `Noise specifications, audio level metering, and image contrast are often expressed as RMS or standard deviation.`,
      },
      {
        id: '2.3', title: 'Signal vs. Underlying Process', page: 17, level: 'core',
        intuition: `A coin toss gives one outcome; the coin's bias is a property of the process. Likewise, one noisy recording is a sample from a random process that has its own mean and spread.`,
        detail: `The measured signal is one realization. If you repeated the experiment, you would get different numbers with the same statistical character. The process is described by a probability distribution, while the signal is described by its actual samples. The book stresses that statistics calculated from a finite record are estimates: a short record can have a mean quite different from the process mean. This is why DSP designs are tested on many noise realizations, not one. It also explains why a filter that looks good on a single trace may fail on another.`,
        keyPoints: [
          'A realization is one outcome of a random process.',
          'Process statistics are theoretical; signal statistics are estimates.',
          'Longer records reduce the variance of estimates, but do not eliminate bias.',
        ],
        caveat: `A stable-looking signal does not prove the process is stationary; the statistics may simply be changing slowly relative to the observation window.`,
      },
      {
        id: '2.4', title: 'The Histogram, Pmf and Pdf', page: 19, level: 'core',
        intuition: `A histogram counts how often values fall into each bin. Normalize by the total and it becomes a probability mass function; let the bins shrink and it approaches a probability density function.`,
        detail: `To form a histogram, divide the amplitude range into bins, count the samples in each bin, and plot count versus amplitude. Normalizing counts by $N$ gives a probability mass function (pmf) for discrete amplitudes. For a continuous process, the probability density function (pdf) gives probability per unit amplitude: the probability of landing in a small interval is approximately $p(x)\\,dx$. A pdf can exceed one; only its integral over an interval is a probability. The book also discusses two-dimensional histograms and scatter plots, which reveal relationships between two signals.`,
        formulas: [
          { label: 'Probability from a pdf', tex: 'P(a < x < b) = \\int_a^b p(x)\\,dx', vars: 'p(x) = probability density' },
          { label: 'Normalization', tex: '\\sum_i P(x_i)=1,\\qquad \\int_{-\\infty}^{\\infty} p(x)\\,dx=1', vars: 'Total probability is one' },
        ],
        keyPoints: [
          'Bin width changes a histogram’s appearance but not the data.',
          'Pmf applies to discrete values; pdf to continuous values.',
          'A 2-D histogram reveals correlation and clustering.',
        ],
        application: `Image histograms drive brightness/contrast adjustments; ADC noise histograms reveal missing codes and clipping.`,
      },
      {
        id: '2.5', title: 'The Normal Distribution', page: 26, level: 'core',
        intuition: `The bell curve appears whenever many independent random influences add together. Most values cluster near the mean, and large deviations become exponentially unlikely.`,
        detail: `The normal (Gaussian) pdf is $p(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-(x-\\mu)^2/(2\\sigma^2)}$. About 68.3% of values lie within one standard deviation of the mean, 95.4% within two, and 99.7% within three. The central limit theorem explains the distribution’s ubiquity: sums of many independent random contributions tend toward Gaussian, regardless of the individual distributions (under mild conditions). The book tabulates the cumulative normal distribution and shows how to generate Gaussian noise from uniform random numbers.`,
        formulas: [
          { label: 'Normal pdf', tex: 'p(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}\\exp\\!\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)', vars: 'μ = mean, σ = standard deviation' },
          { label: 'Empirical rule', tex: 'P(|x-\\mu|<\\sigma)\\approx 68.3\\%,\\quad P(|x-\\mu|<2\\sigma)\\approx 95.4\\%', vars: 'For a Gaussian process' },
        ],
        keyPoints: [
          'A Gaussian is fully specified by mean and variance.',
          'The central limit theorem concerns sums, not individual samples.',
          'Gaussian tails are thin compared with heavy-tailed noise, but not zero.',
        ],
        caveat: `Real interference is often impulsive or bounded, not Gaussian. Assuming Gaussianity can badly underestimate the probability of large outliers.`,
      },
      {
        id: '2.6', title: 'Digital Noise Generation', page: 29, level: 'core',
        intuition: `A random number generator produces uniform values. Add several together and the sum becomes bell-shaped—a cheap Gaussian generator.`,
        detail: `A standard random number generator returns values uniformly distributed between 0 and 1, with mean 0.5 and standard deviation $1/\\sqrt{12}\\approx0.289$. Adding two such numbers gives a triangular distribution with mean 1 and standard deviation $1/\\sqrt{6}$. Adding twelve gives a distribution that is very nearly Gaussian with mean 6 and standard deviation 1; subtract 6 to center it, then scale by the desired standard deviation and add the desired mean. The book also gives the Box–Muller form $X=\\sqrt{-2\\ln R_1}\\cos(2\\pi R_2)$, which converts two uniform numbers into one standard normal value.`,
        formulas: [
          { label: 'Uniform generator statistics', tex: '\\mu=0.5,\\qquad \\sigma=\\frac{1}{\\sqrt{12}}', vars: 'RND uniform on [0,1)' },
          { label: 'Box–Muller transform', tex: 'X=\\sqrt{-2\\ln R_1}\\,\\cos(2\\pi R_2)', vars: 'R₁, R₂ independent uniform [0,1); X ~ N(0,1)' },
        ],
        keyPoints: [
          'Digital generators are deterministic algorithms producing pseudo-random sequences.',
          'Summing 12 uniforms and subtracting 6 is a simple Gaussian approximation.',
          'Always seed reproducibly when testing algorithms.',
        ],
        application: `Monte Carlo simulation, communication bit-error testing, dither generation, and synthetic sensor data.`,
      },
      {
        id: '2.7', title: 'Precision and Accuracy', page: 32, level: 'core',
        intuition: `Precision is repeatability; accuracy is closeness to the truth. A miscalibrated instrument can be very precise and consistently wrong.`,
        detail: `The book separates random error, which scatters repeated measurements, from systematic error, which shifts them all in one direction. Precision describes the scatter; accuracy describes the offset from the true value. In DSP, quantization contributes a roughly uniform error of ±½ LSB, while round-off in floating-point arithmetic contributes relative error that grows with the number of operations. Neither is the same as a biased algorithm. A measurement can be precise but inaccurate, accurate on average but imprecise, or both. Good engineering reports both, along with the conditions under which they were assessed.`,
        keyPoints: [
          'Precision = low random scatter; accuracy = low systematic offset.',
          'Quantization error is bounded; round-off error can accumulate.',
          'Calibration addresses bias; averaging addresses random noise.',
        ],
        caveat: `Averaging reduces random error, not systematic bias. Repeating a flawed measurement many times produces a precise wrong answer.`,
      },
    ],
    labs: [{
      id: 'statistics',
      title: 'Noise, histograms, and the process behind the signal',
      intro: 'Generate uniform and Gaussian noise, change the record length and standard deviation, and watch the histogram approach the underlying pdf. Overlay a sine signal to see how mean and RMS behave.',
      tasks: [
        'Set the generator to uniform and observe the flat histogram. Then switch to Gaussian and compare the tails.',
        'Reduce the record length to 32 samples. How stable is the sample standard deviation?',
        'Add a sine wave and compare the signal’s mean with the process mean. Why does a longer record help?',
      ],
    }],
    worked: {
      title: 'RMS noise from a histogram',
      problem: 'A noise signal has mean 0.02 V and standard deviation 0.15 V. What is its RMS value? If the signal is passed through an amplifier with gain 10, what are the new mean, standard deviation, and RMS?',
      steps: [
        { title: 'Relate RMS to mean and standard deviation', text: 'For any signal, $x_{\\mathrm{rms}}^2 = \\mu^2 + \\sigma^2$.' },
        { title: 'Compute the input RMS', text: '$x_{\\mathrm{rms}}=\\sqrt{0.02^2+0.15^2}=\\sqrt{0.0004+0.0225}=0.1513$ V.' },
        { title: 'Apply the gain', text: 'A linear gain multiplies both mean and standard deviation: $\\mu=0.2$ V, $\\sigma=1.5$ V.' },
        { title: 'Compute the output RMS', text: '$\\sqrt{0.2^2+1.5^2}=\\sqrt{0.04+2.25}=1.513$ V, exactly 10× the input RMS.' },
      ],
      answer: 'Input RMS ≈ 0.151 V; output RMS ≈ 1.513 V, with mean 0.2 V and standard deviation 1.5 V.',
    },
    misconceptions: [
      { wrong: 'Standard deviation is the average distance from the mean.', right: 'It is the square root of the average *squared* distance. Squaring emphasizes large deviations, which is why outliers matter so much.' },
      { wrong: 'A Gaussian histogram proves the noise is Gaussian.', right: 'A histogram of a finite record is noisy. Formal tests or knowledge of the generating process are needed before relying on Gaussian tails.' },
    ],
    takeaways: [
      'Mean and standard deviation summarize location and spread; RMS combines both.',
      'A signal is one realization of a process; statistics from a record are estimates.',
      'Histograms approximate pmfs/pdfs, and the central limit theorem explains why Gaussian noise is common.',
      'Precision and accuracy are different properties; calibration and averaging fix different problems.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'A signal has mean 3 and standard deviation 4. What is its RMS value?',
        options: ['4', '5', '7', '25'],
        answer: 1,
        explanation: '$x_{\\mathrm{rms}}=\\sqrt{\\mu^2+\\sigma^2}=\\sqrt{9+16}=5$. RMS combines the DC and AC powers.',
        wrongHints: { 0: '4 is only the AC standard deviation; the DC offset also contributes power.', 2: 'Means and standard deviations add in quadrature, not directly.', 3: '25 is the mean-square value, not the RMS.' },
      },
      {
        type: 'mcq', question: 'Twelve independent uniform random numbers on [0,1) are summed and 6 is subtracted. The result is approximately:',
        options: ['uniform with mean 0', 'Gaussian with mean 0 and standard deviation 1', 'Gaussian with mean 6 and standard deviation 12', 'triangular with mean 0'],
        answer: 1,
        explanation: 'The sum of 12 uniforms has mean 6 and variance 12·(1/12)=1. Subtracting 6 centers it; the central limit theorem makes the shape nearly Gaussian.',
        wrongHints: { 0: 'The sum of uniforms is not uniform; it is bell-shaped.', 2: 'Subtracting 6 removes the mean, and variances add to 1, not 12.', 3: 'The triangular shape comes from summing only two uniforms.' },
      },
      {
        type: 'tf', question: 'A precise measurement is necessarily accurate.',
        options: ['True', 'False'], answer: 1,
        explanation: 'Precision means repeated measurements agree; accuracy means they agree with the true value. A mis-calibrated instrument can be precisely wrong.',
      },
    ],
  },

  {
    number: 3,
    title: 'ADC and DAC',
    part: 'Foundations',
    tagline: 'Crossing the analog–digital boundary without losing the information you need.',
    intro: `Almost all interesting signals begin as continuous physical quantities. To process them digitally we must sample in time and quantize in amplitude; to return them to the world we must reconstruct. Both steps are irreversible in principle: once aliasing or clipping has occurred, no algorithm can know what was lost.

This chapter is the practical heart of the analog–digital interface. It explains quantization and dither, the sampling theorem and aliasing, reconstruction and anti-imaging filters, the choice of anti-alias filter for different encoding schemes, multirate conversion, and single-bit methods such as delta modulation.`,
    objectives: [
      'Quantify quantization error and the SNR of an ideal N-bit converter.',
      'State and apply the sampling theorem, including aliasing and phase inversion.',
      'Explain reconstruction, zero-order hold, and anti-imaging filtering.',
      'Choose an anti-alias filter strategy for frequency-domain vs. time-domain signals.',
      'Describe decimation, interpolation, and single-bit conversion.',
    ],
    prerequisites: [1, 2],
    sections: [
      {
        id: '3.1', title: 'Quantization', page: 35, level: 'core',
        intuition: `Quantization rounds each sample to the nearest allowed level. The rounding error is small but unavoidable—like measuring with a ruler whose smallest mark is one LSB.`,
        detail: `An $N$-bit converter has $2^N$ output codes. Over a full-scale range $2A$, the step size (one least significant bit, LSB) is $\\Delta = 2A/2^N$. Rounding error is bounded by $\\pm\\Delta/2$; for a busy signal it is often modeled as uniform white noise with variance $\\Delta^2/12$. A full-scale sine then has an ideal signal-to-noise ratio of about $6.02N+1.76$ dB. The book emphasizes two practical issues: *dither*, adding a small noise before quantization so a small or slowly varying signal is not stuck on one code, and the difference between quantization error and true analog noise. Dither can linearize the average transfer characteristic at the cost of a slightly higher noise floor.`,
        formulas: [
          { label: 'Quantization step', tex: '\\Delta = \\frac{2A}{2^N}', vars: '2A = full-scale span, N = bits' },
          { label: 'Ideal SNR, full-scale sine', tex: '\\mathrm{SNR}_{\\mathrm{dB}} \\approx 6.02N + 1.76', vars: 'Uniform quantization noise, sine input' },
          { label: 'Quantization noise power', tex: '\\sigma_q^2 = \\frac{\\Delta^2}{12}', vars: 'Assumes busy input and uniform error' },
        ],
        keyPoints: [
          'Each extra bit adds about 6 dB of dynamic range.',
          'Quantization error is bounded, not Gaussian, but is often modeled as uniform noise.',
          'Dither trades a small noise increase for better average linearity and resolution below one LSB.',
        ],
        caveat: `The 6.02N+1.76 dB formula assumes a full-scale sine and uniform error. A low-level or correlated signal can have far worse distortion than the formula predicts.`,
        application: `Audio ADCs, digital oscilloscopes, software-defined radios, and image sensors all specify bits, full-scale range, ENOB, and noise floor.`,
      },
      {
        id: '3.2', title: 'The Sampling Theorem', page: 39, level: 'core',
        intuition: `Sampling records a signal at discrete instants. If the signal changes too fast between samples, different continuous waves can produce exactly the same numbers—and the original is lost.`,
        detail: `A continuous signal is properly sampled if it can be reconstructed exactly from its samples. The sampling theorem states that this is possible only if the signal contains no frequency components at or above half the sampling rate, $f_s/2$. Frequencies above that limit *alias*: a continuous frequency $f$ appears at $|f - k f_s|$ for the integer $k$ that brings it into $[0,f_s/2]$. For example, with $f_s=1000$ Hz, a 950 Hz sine appears as 50 Hz, and its phase is inverted. The book notes that the terms “Nyquist frequency” and “Nyquist rate” are used inconsistently in the literature; in this book both mean one-half the sampling rate. Sampling an impulse train produces spectral copies centered at multiples of $f_s$; reconstruction must remove all but the baseband copy.`,
        formulas: [
          { label: 'Sampling condition', tex: 'f_s > 2 f_{\\max}', vars: 'f_s = sampling rate; f_max = highest signal frequency' },
          { label: 'Aliased frequency', tex: 'f_{\\mathrm{alias}} = \\left| f - f_s\\,\\mathrm{round}\\!\\left(\\frac{f}{f_s}\\right)\\right|', vars: 'For f above f_s/2' },
          { label: 'Nyquist frequency/rate (Smith)', tex: 'f_N = \\frac{f_s}{2}', vars: 'Both terms used for half the sampling rate' },
        ],
        keyPoints: [
          'The theorem is a strict band-limit condition, not a rule of thumb.',
          'Aliasing changes frequency and can invert phase by 180°.',
          'Once aliased, frequencies overlap and cannot be separated afterward.',
        ],
        caveat: `A signal exactly at f_s/2 is a special boundary case: its amplitude and phase may not be recoverable, and real filters cannot have a perfectly sharp cutoff. Practical systems leave a guard band.`,
        application: `Anti-alias filtering before every ADC; oversampling in audio and instrumentation; understanding moiré in images and wheel-spoke effects in video.`,
      },
      {
        id: '3.3', title: 'Digital-to-Analog Conversion', page: 44, level: 'core',
        intuition: `A DAC turns numbers back into voltages. The simplest circuit holds each value until the next sample, producing a staircase that contains the desired signal plus unwanted high-frequency images.`,
        detail: `A zero-order-hold DAC outputs a constant voltage for one sampling interval. Its frequency response is a sinc envelope, $H(f)=\\mathrm{sinc}(f/f_s)e^{-j\\pi f/f_s}$, which attenuates high frequencies but does not remove the spectral images centered at $f_s, 2f_s,\\ldots$. A reconstruction (anti-imaging) low-pass filter after the DAC removes those images and smooths the staircase. The book also discusses more accurate DAC architectures and the tradeoff between cost, speed, and resolution. The key idea is that the DAC’s output is not a continuous curve through the samples; it is a piecewise-constant waveform whose spectrum must be cleaned up.`,
        formulas: [
          { label: 'Zero-order-hold magnitude', tex: '|H(f)| = \\left|\\mathrm{sinc}\\!\\left(\\frac{f}{f_s}\\right)\\right|', vars: 'sinc(x)=sin(πx)/(πx)' },
        ],
        keyPoints: [
          'Zero-order hold creates images at multiples of the sampling rate.',
          'A reconstruction filter removes images and smooths the staircase.',
          'The hold’s sinc response causes a small high-frequency droop in the baseband.',
        ],
        application: `Audio DACs, arbitrary waveform generators, and digital control outputs.`,
      },
      {
        id: '3.4', title: 'Analog Filters for Data Conversion', page: 48, level: 'core',
        intuition: `The analog filter before an ADC and the one after a DAC are the gatekeepers of the digital world. Their job is to ensure that only representable frequencies enter or leave.`,
        detail: `An anti-alias filter is a low-pass filter placed before the ADC; it must attenuate everything above $f_s/2$ enough that aliased energy is below the converter’s noise floor. A reconstruction filter after the DAC removes spectral images. The book compares three classic analog responses: Bessel (best step response, linear phase), Butterworth (maximally flat passband), and Chebyshev (sharpest roll-off, passband ripple and overshoot). The choice depends on how information is encoded. Frequency-domain signals such as audio tolerate phase distortion but need strong stopband attenuation; time-domain signals such as EKG pulses and images need gentle, symmetric edge response.`,
        keyPoints: [
          'Anti-alias filters prevent irreversible aliasing; reconstruction filters remove images.',
          'Bessel: time-domain fidelity. Butterworth: flat passband. Chebyshev: sharp cutoff with ripple.',
          'Filter order, cutoff, and transition width trade against cost, delay, and distortion.',
        ],
        caveat: `No real filter has infinite stopband attenuation. “Anti-alias” means “reduce aliasing to an acceptable level,” not “eliminate it.”`,
        application: `A digital oscilloscope may use a Bessel front end to preserve pulse shape; a spectrum analyzer may use a sharp Chebyshev filter to reject out-of-band signals.`,
      },
      {
        id: '3.5', title: 'Selecting The Antialias Filter', page: 55, level: 'core',
        intuition: `How you digitize depends on what carries the information. If the message lives in frequency content, protect the spectrum; if it lives in the waveform’s shape, protect the edges.`,
        detail: `For frequency-domain encoded signals—audio, radio, vibration spectra—aliasing directly corrupts the information, so a sharp filter (Chebyshev, elliptic, or high-order Butterworth) is appropriate. For time-domain encoded signals—EKG, pulses, images—the shape and timing of edges matter, so a Bessel filter with gentle phase distortion is often better. The book suggests a Bessel cutoff near one-quarter of the sampling rate for time-domain signals, giving roughly two samples on a rising edge and preserving sub-sample edge timing. It also notes that no filter can preserve frequency content above $f_s/2$; the goal is to remove it gracefully. Sometimes the best choice is no anti-alias filter at all, if aliased noise is acceptable and edge sharpness is paramount.`,
        keyPoints: [
          'Frequency-domain information → sharp anti-alias filter.',
          'Time-domain information → gentle linear-phase filter, or deliberate oversampling.',
          'A Bessel cutoff near f_s/4 is a common starting point for pulse-like signals.',
        ],
        caveat: `“No filter” is a legitimate engineering choice only when aliased noise is harmless and the loss of sub-sample timing is acceptable.`,
      },
      {
        id: '3.6', title: 'Multirate Data Conversion', page: 58, level: 'core',
        intuition: `Sometimes it is cheaper to sample very fast with a simple analog filter, then reduce the rate digitally. This replaces expensive analog precision with arithmetic.`,
        detail: `Decimation lowers the sampling rate: low-pass filter the digital signal to the new Nyquist limit, then discard samples. Interpolation raises the rate: insert zeros between samples, then low-pass filter to remove the images. The book’s voice-recorder example samples at 64 kHz through a simple analog filter, applies a sharp digital low-pass at 3 kHz, and decimates to 8 kHz. On playback, interpolation returns to 64 kHz so a simple analog reconstruction filter suffices. Multirate conversion is attractive because digital filters can be far more precise and repeatable than analog components, and because the heavy filtering is done where it is cheap.`,
        formulas: [
          { label: 'Decimation by M', tex: 'y[n] = \\sum_k h[k]\\,x[nM-k]', vars: 'Low-pass h first, then keep every M-th sample' },
        ],
        keyPoints: [
          'Decimation = anti-alias low-pass + downsampling.',
          'Interpolation = zero-stuffing + anti-image low-pass.',
          'Digital filters make steep transitions practical and repeatable.',
        ],
        application: `Audio sample-rate conversion, software-defined radio, Sigma-delta converters, and image resizing.`,
      },
      {
        id: '3.7', title: 'Single Bit Data Conversion', page: 60, level: 'advanced',
        intuition: `A one-bit converter seems absurdly coarse, but if you update it fast enough and shape the error, the average can be extremely precise.`,
        detail: `Delta modulation compares the input with a tracked approximation and outputs one bit per clock: a one raises the approximation, a zero lowers it. The bit stream represents the signal’s slope. Its weaknesses are slew-rate limiting and a fixed step size. Continuously variable slope delta (CVSD) modulation adapts the step size when several identical bits occur, improving tracking of speech. Sigma-delta modulation pushes quantization noise to high frequencies (noise shaping), where it can be removed by a digital low-pass filter and decimation. This is why 1-bit sigma-delta converters can achieve very high resolution for audio.`,
        keyPoints: [
          'Delta modulation encodes slope as a one-bit stream.',
          'CVSD adapts the step size to avoid slew limiting.',
          'Sigma-delta uses oversampling and noise shaping to trade speed for resolution.',
        ],
        caveat: `Single-bit conversion is not “free resolution.” It depends on high oversampling, precise clocks, and effective digital decimation/filtering.`,
        application: `Audio ADCs/DACs, class-D amplifiers, and low-cost sensor interfaces.`,
      },
    ],
    labs: [{
      id: 'sampling',
      title: 'Sampling, aliasing, and quantization',
      intro: 'Sample a continuous sine at a controllable rate, reconstruct it, and see aliases appear when the input exceeds Nyquist. Then quantize the result to N bits and inspect the error and SNR.',
      tasks: [
        'Set the input to 0.9 of the sampling rate. What frequency does the sampled signal appear to have?',
        'Lower the sampling rate until the reconstruction fails. Identify the exact Nyquist boundary.',
        'Reduce the bit depth to 4. Compare the staircase, the error waveform, and the measured SNR with 6.02N+1.76 dB.',
      ],
    }, {
      id: 'sigma-delta',
      title: 'Single-bit sigma-delta conversion',
      intro: 'A one-bit feedback loop trades amplitude resolution for speed. See the bitstream, the shaped noise, and the digital decimation that recovers the waveform.',
      tasks: [
        'Increase the oversampling ratio. What happens to the in-band noise?',
        'Compare first and second order. Where is the noise pushed?',
        'Raise the input amplitude toward full scale. When does the modulator overload?',
      ],
    }],
    worked: {
      title: 'Choosing an ADC for a vibration sensor',
      problem: 'A vibration sensor produces useful content from DC to 2 kHz, plus a strong 12 kHz resonance that must not alias into the measurement band. The ADC supports 16-bit conversion at up to 50 kSa/s. Choose a sampling rate and specify the anti-alias filter’s required attenuation at 12 kHz.',
      steps: [
        { title: 'Choose a sampling rate with margin', text: 'Nyquist requires $f_s>4$ kHz. Choose 10 kSa/s, giving a guard band from 2 to 5 kHz.' },
        { title: 'Locate the alias of the resonance', text: 'With $f_s=10$ kHz, 12 kHz aliases to $|12-10|=2$ kHz—right at the top of the measurement band.' },
        { title: 'Specify stopband attenuation', text: 'The 12 kHz component must be attenuated enough that its aliased version is below the converter noise floor. For a 16-bit converter, the ideal SNR is about 98 dB, so target at least 100 dB at 12 kHz.' },
        { title: 'Check the transition band', text: 'The filter must pass 2 kHz and reject 12 kHz, a wide transition. A moderate-order Butterworth or Chebyshev can meet this; a Bessel would blur pulse edges if timing mattered.' },
      ],
      answer: 'Sample at 10 kSa/s (or higher) and use an anti-alias low-pass with ≥100 dB attenuation at 12 kHz while preserving the 0–2 kHz band. If 20 kSa/s were available, the guard band would be wider and the analog filter easier.',
    },
    misconceptions: [
      { wrong: 'Sampling at exactly twice the highest frequency is always safe.', right: 'The theorem requires strictly greater than twice the highest frequency, and real signals/filters have nonzero transition bands. Practical systems sample well above 2f_max.' },
      { wrong: 'Aliasing only affects frequencies above Nyquist; it cannot affect lower frequencies.', right: 'Aliased high-frequency energy lands *on top of* legitimate low-frequency content, corrupting both.' },
      { wrong: 'More bits always means a better measurement.', right: 'Bits set the quantization floor, but analog noise, distortion, reference drift, and aliasing often dominate. Effective number of bits (ENOB) can be much lower than the ADC’s nominal resolution.' },
    ],
    takeaways: [
      'Sampling must be preceded by band-limiting; aliasing is irreversible.',
      'Quantization sets a noise floor of roughly 6.02N+1.76 dB for a full-scale sine, and dither can improve average linearity.',
      'Reconstruction requires removing spectral images, not just connecting the dots.',
      'The best anti-alias filter depends on whether information is encoded in frequency or in waveform shape.',
      'Multirate and single-bit methods trade speed and digital complexity for analog precision.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'A 7 kHz sine is sampled at 10 kSa/s. What frequency appears in the digital data?',
        options: ['7 kHz', '3 kHz', '17 kHz', '5 kHz'],
        answer: 1,
        explanation: 'The Nyquist frequency is 5 kHz. The 7 kHz component aliases to |7−10| = 3 kHz, and its phase is inverted.',
        wrongHints: { 0: 'Frequencies above 5 kHz cannot be represented at this rate.', 2: '17 kHz is outside the digital band; aliasing folds it down.', 3: '5 kHz is Nyquist, not the alias of 7 kHz.' },
      },
      {
        type: 'mcq', question: 'An ideal 12-bit ADC with a full-scale sine input has an SNR of about:',
        options: ['72 dB', '74 dB', '12 dB', '144 dB'],
        answer: 1,
        explanation: '$6.02(12)+1.76 \\approx 72.2+1.76 = 73.99$ dB, about 74 dB.',
        wrongHints: { 0: '72 dB omits the 1.76 dB sine-specific term.', 2: '12 dB is just the bit count, not the SNR.', 3: '144 dB would correspond to roughly 24 bits.' },
      },
      {
        type: 'mcq', question: 'Which analog filter is generally preferred before digitizing a pulse-like time-domain signal?',
        options: ['A high-order Chebyshev with steep roll-off', 'A Bessel filter with gentle phase response', 'No filter under any circumstances', 'A band-reject filter at the signal frequency'],
        answer: 1,
        explanation: 'Bessel filters have maximally flat group delay, preserving edge shape and timing. Chebyshev filters ring and overshoot, distorting pulses.',
        wrongHints: { 0: 'Chebyshev’s sharp magnitude response comes with phase distortion and overshoot.', 2: 'No filter can be acceptable when high-frequency noise would alias, though it is a deliberate tradeoff in some systems.', 3: 'A band-reject filter would remove wanted signal content.' },
      },
      {
        type: 'tf', question: 'Dither is added to make quantization error larger on purpose, improving average linearity for small signals.',
        options: ['True', 'False'], answer: 0,
        explanation: 'Dither deliberately adds a small random signal before quantization. It prevents a small or slowly varying input from getting stuck on one code and makes the average quantization transfer more linear.',
      },
    ],
  },

  {
    number: 4,
    title: 'DSP Software',
    part: 'Foundations',
    tagline: 'How numbers are stored, how arithmetic fails, and why execution speed is an engineering constraint.',
    intro: `A DSP algorithm is only as good as the arithmetic that executes it. Fixed-point and floating-point formats have different ranges, resolutions, and failure modes; loops that look harmless can accumulate error; and the language and hardware determine whether a design runs in real time.

This chapter is about the practical numerics of DSP software. It covers integer and floating-point representation, precision and round-off, the cost of different programming choices, and the hardware features that make DSP fast. The goal is not to turn you into a compiler engineer, but to make you suspicious of results that look numerically plausible but are not.`,
    objectives: [
      'Explain fixed-point and floating-point representation and their tradeoffs.',
      'Estimate round-off error and dynamic range for common word lengths.',
      'Recognize overflow, underflow, and error accumulation.',
      'Reason about execution speed across languages and hardware.',
      'Apply practical programming rules that preserve numerical accuracy.',
    ],
    prerequisites: [2, 3],
    sections: [
      {
        id: '4.1', title: 'Computer Numbers', page: 67, level: 'core',
        intuition: `Computers store a finite pattern of bits. Every number format is a compromise between range (how big), resolution (how fine), and speed.`,
        detail: `A binary word of $B$ bits has $2^B$ distinct patterns. How those patterns map to numbers defines the format. Integer formats place values on a uniform grid; floating-point formats place them on a grid whose spacing grows with magnitude. DSP uses both: fixed point for cheap, fast, predictable arithmetic; floating point for wide dynamic range and ease of development. The book stresses that there is no “best” format independent of the application. A 16-bit fixed-point processor may be ideal for a mass-produced audio device, while a 32-bit floating-point processor is easier for prototype algorithm development.`,
        keyPoints: [
          'B bits give 2^B distinct values, not 2^B uniformly spaced values in floating point.',
          'Format choice trades range, resolution, speed, power, and cost.',
          'The same algorithm can behave very differently in fixed and floating point.',
        ],
      },
      {
        id: '4.2', title: 'Fixed Point (Integers)', page: 68, level: 'core',
        intuition: `Fixed point is a ruler with evenly spaced marks. It is simple and fast, but if a value falls off the end of the ruler, it wraps or saturates.`,
        detail: `In two’s-complement fixed point, a $B$-bit integer represents values from $-2^{B-1}$ to $2^{B-1}-1$. Fractional formats (Q formats) interpret the same bits with an implied binary point, giving a fixed step size. Addition is exact until overflow; multiplication produces a double-width product that must be rounded or truncated. Overflow wraps in standard integer arithmetic unless the processor supports saturation. The book emphasizes scaling: keep signals within range, but not so low that quantization noise dominates. Fixed-point DSP is attractive because it is fast, deterministic, and cheap, but designing word lengths and scaling is part of the algorithm.`,
        formulas: [
          { label: 'Two’s-complement range', tex: '-2^{B-1} \\le x \\le 2^{B-1}-1', vars: 'B-bit signed integer' },
          { label: 'Q-format resolution', tex: '\\Delta = 2^{-F}', vars: 'F fractional bits; total B = integer + fractional + sign' },
        ],
        keyPoints: [
          'Uniform spacing, bounded range, fast integer arithmetic.',
          'Overflow can wrap catastrophically; saturation is often safer for audio/control.',
          'Scaling determines the tradeoff between clipping and quantization noise.',
        ],
        caveat: `Two’s-complement wrap-around is not a small error; a large positive value can become a large negative value, producing a loud click or unstable feedback loop.`,
      },
      {
        id: '4.3', title: 'Floating Point (Real Numbers)', page: 70, level: 'core',
        intuition: `Floating point is scientific notation in binary. It keeps a fixed number of significant digits and moves the decimal point, so it can represent both tiny and huge values.`,
        detail: `IEEE 754 single precision uses 32 bits: 1 sign, 8 exponent, and 23 fraction bits, with an implicit leading one. Its relative resolution is about $2^{-24}\\approx6\\times10^{-8}$, and its range is roughly $\\pm3.4\\times10^{38}$. Double precision uses 64 bits (11 exponent, 52 fraction), giving about $10^{-16}$ relative resolution and a range near $10^{308}$. The spacing between adjacent floating-point numbers grows with magnitude, so absolute error scales with the value. Special patterns represent ±0, ±∞, subnormals, and NaN. Floating point is easier to program because scaling is automatic, but it is not exact: 0.1 has no finite binary representation.`,
        formulas: [
          { label: 'Single-precision relative resolution', tex: '\\epsilon \\approx 2^{-24} \\approx 6\\times10^{-8}', vars: 'IEEE 754 binary32' },
          { label: 'Double-precision relative resolution', tex: '\\epsilon \\approx 2^{-53} \\approx 1.1\\times10^{-16}', vars: 'IEEE 754 binary64' },
        ],
        keyPoints: [
          'Floating point has wide range but non-uniform absolute spacing.',
          'Relative precision is roughly constant; absolute precision degrades for large values.',
          'NaN and infinity propagate through calculations and must be handled explicitly.',
        ],
        application: `Prototyping, scientific computing, and algorithms with wide dynamic range; fixed point is often used in high-volume embedded products.`,
      },
      {
        id: '4.4', title: 'Number Precision', page: 72, level: 'core',
        intuition: `Every arithmetic operation rounds. A single rounding is tiny; millions of roundings can drift, and some algorithms accumulate error much faster than others.`,
        detail: `The book illustrates round-off with a loop that adds two random numbers to a variable and subtracts them again; ideally the variable never changes, but in floating point it wanders. If rounding errors are random, the total error grows roughly as the square root of the number of operations. If they are systematically biased, error grows linearly and can be far worse. The author estimates single-precision error as about one part in forty million per operation, and double precision as about one part in forty quadrillion per operation, in the worst case. Practical defenses include using higher precision for accumulators, avoiding subtracting nearly equal numbers, reordering sums, and using numerically stable filter structures.`,
        formulas: [
          { label: 'Random error growth', tex: '\\sigma_{\\mathrm{total}} \\propto \\sqrt{N_{\\mathrm{ops}}}', vars: 'Independent rounding errors' },
          { label: 'Additive error growth', tex: '\\sigma_{\\mathrm{total}} \\propto N_{\\mathrm{ops}}', vars: 'Biased rounding errors' },
        ],
        keyPoints: [
          'Round-off is unavoidable; its growth depends on algorithm structure.',
          'Accumulators and long filters are especially vulnerable.',
          'Catastrophic cancellation occurs when subtracting nearly equal numbers.',
        ],
        caveat: `Higher precision reduces round-off but cannot fix an ill-conditioned algorithm or a biased estimator.`,
      },
      {
        id: '4.5', title: 'Execution Speed: Program Language', page: 76, level: 'support',
        intuition: `The same algorithm can run hundreds of times faster depending on how it is expressed and compiled. In real-time DSP, speed is not an optimization detail—it is a design constraint.`,
        detail: `The book compares interpreted BASIC, compiled languages such as C, and assembly. Interpreted code pays overhead per statement; compiled code translates loops into machine instructions; hand-written assembly can exploit special addressing modes and parallelism. For DSP, the inner loop dominates: a few multiply-accumulate operations repeated millions of times per second. Choosing a language is therefore about predictable performance and access to hardware features, not just developer convenience. Modern practice adds vector intrinsics, compiler autovectorization, and domain-specific libraries, but the principle is unchanged: measure the inner loop, not the GUI.`,
        keyPoints: [
          'Inner-loop cost dominates DSP execution time.',
          'Compiled code is usually far faster than interpreted code for tight loops.',
          'Assembly/intrinsics can exploit DSP-specific instructions but cost portability and development time.',
        ],
        application: `Real-time audio must finish all processing within one sample period; a 48 kHz system has about 20.8 µs per sample.`,
      },
      {
        id: '4.6', title: 'Execution Speed: Hardware', page: 80, level: 'support',
        intuition: `A DSP chip is not just a fast CPU. Its memory paths, addressing modes, and multiply-accumulate units are shaped around signal-processing loops.`,
        detail: `General-purpose processors optimize control flow and cache locality; DSPs optimize repetitive arithmetic on streaming data. Features such as a hardware multiplier, multiply–accumulate (MAC), multiple memory banks, circular addressing, and zero-overhead loops reduce the cost of convolution and filtering. The book contrasts von Neumann architectures, where instructions and data share a bus, with Harvard architectures, which separate them so an instruction fetch and a data access can occur simultaneously. Modern high-performance processors blur the distinction, but the design pressure remains: keep the arithmetic units fed.`,
        keyPoints: [
          'MAC units and multiple buses make convolution cheap.',
          'Circular addressing implements delay lines without pointer wrap code.',
          'Memory bandwidth, not just clock rate, often limits DSP throughput.',
        ],
      },
      {
        id: '4.7', title: 'Execution Speed: Programming Tips', page: 84, level: 'support',
        intuition: `Fast DSP code is usually simple code executed many times. Remove work from the inner loop, avoid unnecessary division, and let the hardware do what it is good at.`,
        detail: `The book’s practical advice includes: avoid division inside loops when a reciprocal or shift will do; use integer or fixed-point arithmetic where appropriate; unroll small loops to reduce overhead; use lookup tables for nonlinear functions; keep data in cache-friendly order; and exploit symmetric coefficients in FIR filters. It also warns against optimizing before measuring. Modern compilers can defeat clever hand optimizations, so profiling and generated assembly inspection matter. Numerical accuracy and real-time deadlines must be checked together: a faster approximation that loses too much precision is not an optimization.`,
        keyPoints: [
          'Move invariant work outside loops.',
          'Prefer multiply/add and table lookup to division and transcendental calls.',
          'Measure before and after optimizing; check numerical accuracy as well as speed.',
        ],
        application: `FIR filtering, FFT butterflies, and image convolution are all inner-loop-bound; small changes there dominate total runtime.`,
      },
    ],
    labs: [{
      id: 'precision',
      title: 'When arithmetic quietly drifts',
      intro: 'Repeat the book’s add-and-subtract experiment in simulated fixed point and floating point. Watch error grow randomly or systematically, and compare 16-bit, 32-bit, and 64-bit accumulators.',
      tasks: [
        'Run the float experiment for 2,000 iterations. Does the error grow like √N or like N?',
        'Switch to 16-bit fixed point and add a small signal. Find the point where quantization, not round-off, dominates.',
        'Try the compensated (Kahan) summation option. How much does it reduce drift?',
      ],
    }],
    worked: {
      title: 'Will a 16-bit accumulator overflow?',
      problem: 'A FIR filter sums 64 products. Each input sample is bounded by 1.0, and each coefficient is bounded by 0.05. Using Q15 fixed point (range −1 to just under +1), can the accumulator overflow if it has 16 bits? What accumulator width is needed for safety?',
      steps: [
        { title: 'Bound one product', text: 'Each product is at most $1.0\\times0.05=0.05$ in real units, or $0.05\\times32768\\approx1638$ in Q15 integer units.' },
        { title: 'Bound the sum', text: 'Sixty-four such products sum to at most $64\\times0.05=3.2$ in real units.' },
        { title: 'Compare with the format range', text: 'Q15 cannot represent 3.2; it saturates near 1. A 16-bit accumulator would overflow badly.' },
        { title: 'Choose a wider accumulator', text: 'A 32-bit accumulator in Q15 has a range of about ±65536 in real units, far more than 3.2. Keep the products and sum in 32 bits, then scale/round once at the output.' },
      ],
      answer: 'A 16-bit accumulator is insufficient. Use at least a 32-bit accumulator (a common DSP design), and apply saturation only at the final output. The worst-case bound is conservative because coefficients rarely align, but overflow must be impossible by design.',
    },
    misconceptions: [
      { wrong: 'Floating point is exact, so numerical error is not a concern.', right: 'Floating point rounds every operation. Relative error is small but can accumulate, and cancellation can destroy accuracy.' },
      { wrong: 'A 32-bit float always has more resolution than a 16-bit integer.', right: 'Float has more *range* and relative precision, but near small values its absolute spacing may be finer or coarser depending on the exponent; fixed point has uniform spacing.' },
      { wrong: 'More bits always solve an overflow problem.', right: 'Scaling, saturation logic, and algorithm structure matter. An unbounded accumulator will eventually overflow at any fixed width.' },
    ],
    takeaways: [
      'Fixed point offers uniform resolution and speed; floating point offers range and ease of use.',
      'Round-off growth depends on whether errors are random or biased; accumulators deserve extra precision.',
      'Inner-loop arithmetic and memory access determine real-time performance.',
      'DSP hardware is designed around multiply–accumulate, circular buffers, and streaming data.',
      'Correctness includes numerical behavior, not just algorithmic intent.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'A 16-bit two’s-complement integer ranges from:',
        options: ['0 to 65,535', '−32,768 to 32,767', '−65,535 to 65,535', '−1 to 1'],
        answer: 1,
        explanation: 'With one sign bit and 15 magnitude bits, the range is −2^15 to 2^15−1, i.e., −32,768 to 32,767.',
        wrongHints: { 0: 'That is the unsigned range.', 2: 'There are 65,536 total codes, split unevenly around zero.', 3: 'That describes a normalized Q15 interpretation, not the integer code range.' },
      },
      {
        type: 'mcq', question: 'Which situation is most likely to cause catastrophic cancellation?',
        options: ['Adding two large positive numbers', 'Subtracting two nearly equal floating-point numbers', 'Multiplying by a power of two', 'Converting an integer to floating point'],
        answer: 1,
        explanation: 'Subtracting nearly equal values leaves only the small difference, while the leading digits—and their rounding errors—cancel. Relative error can explode.',
        wrongHints: { 0: 'Adding large numbers can overflow, but does not cancel significant digits.', 2: 'Multiplying by a power of two only changes the exponent and is exact in binary floating point.', 3: 'Integer-to-float conversion may round, but does not subtract nearly equal quantities.' },
      },
      {
        type: 'tf', question: 'A 32-bit floating-point number has roughly the same number of significant bits as a 32-bit fixed-point number, so their numerical behavior is equivalent.',
        options: ['True', 'False'], answer: 1,
        explanation: 'Both use 32 bits, but float spends bits on exponent and sign, leaving about 24 significant bits, and its spacing varies with magnitude. Fixed point has uniform spacing and different overflow behavior.',
      },
    ],
  },
];
