/**
 * Part III — Digital Filters (chapters 14–21)
 */

export const part3 = [
  {
    number: 14,
    title: 'Introduction to Digital Filters',
    part: 'Digital Filters',
    tagline: 'Choosing what to pass, what to block, and what to preserve in time.',
    intro: `A digital filter is a system that shapes a signal by changing its frequency content or its time-domain waveform. The same filter can look excellent in one domain and terrible in the other. Designing a filter therefore begins with a question about the *information*: is it encoded in the frequencies, in the shape of the waveform, or in both?

This chapter establishes the vocabulary—passband, stopband, cutoff, ripple, roll-off, rise time, overshoot, phase—and classifies filters by impulse-response length, recursion, and phase behavior. It is the map for the filter chapters that follow.`,
    objectives: [
      'Define the four standard filter responses and their parameters.',
      'Distinguish time-domain from frequency-domain information.',
      'Read step, impulse, magnitude, and phase specifications.',
      'Use spectral inversion and cascading to build other filter types.',
      'Classify FIR/IIR, recursive/nonrecursive, and linear/minimum-phase filters.',
    ],
    prerequisites: [6, 7, 8, 11],
    sections: [
      {
        id: '14.1', title: 'Filter Basics', page: 261, level: 'core',
        intuition: `A filter is a frequency-dependent gate. A low-pass lets slow changes through and blocks fast ones; a high-pass does the opposite; band-pass and band-reject select or remove a middle band.`,
        detail: `Filters are used for separation (isolating a signal from interference), noise reduction, wave shaping, and modeling. A low-pass filter passes frequencies below its cutoff and attenuates those above; a high-pass does the reverse; a band-pass passes a range; a band-reject (notch) removes one. The ideal response is a rectangular passband with infinite stopband attenuation and zero transition width—impossible in practice. Real filters trade roll-off steepness, ripple, phase distortion, computation, and latency. Filters can be implemented by convolution with an impulse response (FIR) or by recursion (IIR). The chapter emphasizes that “cutoff” must be defined: it may mean the −3 dB point, the 50% amplitude point, or the edge of a ripple band.`,
        keyPoints: [
          'Four standard responses: low-pass, high-pass, band-pass, band-reject.',
          'Ideal filters are rectangular and unrealizable; practical filters trade parameters.',
          'Cutoff definition varies between filter families and must be stated.',
        ],
        application: `Anti-alias filtering, audio equalization, mains-hum removal, channel selection, and image smoothing.`,
      },
      {
        id: '14.2', title: 'How Information is Represented in Signals', page: 265, level: 'core',
        intuition: `Some signals carry their message in frequency content (music), others in waveform shape (an EKG or an image). A filter that preserves one may destroy the other.`,
        detail: `Frequency-domain encoded signals—audio, radio, vibration spectra—convey information through the amplitudes and phases of sinusoids. Changing phase can alter the oscilloscope trace without changing what is heard; removing a frequency band removes part of the message. Time-domain encoded signals—EKG pulses, radar returns, images—convey information through the shape, timing, and location of features. A filter that rings or overshoots can distort these features even if its magnitude response looks good. The book uses this distinction to guide anti-alias filter selection (Chapter 3) and filter design: a Chebyshev may be ideal for audio but unacceptable for a pulse; a Bessel or linear-phase FIR may be required for waveforms.`,
        keyPoints: [
          'Frequency-domain information: preserve the spectrum; phase may matter less.',
          'Time-domain information: preserve shape and timing; phase and overshoot matter.',
          'Many real signals contain both, so the design must balance the two.',
        ],
        caveat: `“Phase is inaudible” is an approximation for steady sounds. Transients, stereo imaging, and multi-channel processing can be sensitive to phase.`,
      },
      {
        id: '14.3', title: 'Time Domain Parameters', page: 266, level: 'core',
        intuition: `Hit a filter with a step and watch how it rises. Rise time, overshoot, ringing, and settling time tell you how it will treat edges and pulses.`,
        detail: `The step response describes the filter’s reaction to a sudden change. Rise time is often measured from 10% to 90% of the final value; settling time is the time to remain within a specified error band (1%, 0.1%). Overshoot and ringing indicate frequency-domain sharpness and phase behavior. The impulse response shows the filter kernel directly and determines convolution cost. Group delay describes how long different frequencies take to pass; if it varies with frequency, a pulse will disperse. For time-domain encoded signals, a gentle, linear-phase response is often more important than a steep magnitude roll-off.`,
        formulas: [
          { label: 'Rise time (10–90%)', tex: 't_r \\approx \\frac{0.35}{f_{-3\\mathrm{dB}}}', vars: 'For a first-order low-pass, approximately' },
          { label: 'Group delay', tex: '\\tau_g(\\omega)=-\\frac{d\\phi}{d\\omega}', vars: 'Frequency-dependent delay' },
        ],
        keyPoints: [
          'Step response reveals rise time, overshoot, ringing, and settling.',
          'Impulse response is the filter kernel used in convolution.',
          'Variable group delay disperses pulses even when magnitude is flat.',
        ],
      },
      {
        id: '14.4', title: 'Frequency Domain Parameters', page: 268, level: 'core',
        intuition: `A frequency-response plot shows how much each frequency is amplified or attenuated, and how much it is delayed. Specifications turn that curve into a design target.`,
        detail: `Key parameters include cutoff frequency, passband ripple, stopband attenuation, transition bandwidth, and roll-off rate. Roll-off is often expressed in dB per octave or dB per decade; a first-order filter rolls off at about 6 dB/octave, a second-order at 12 dB/octave, and so on. Passband ripple is the maximum deviation from flat gain. Stopband attenuation is the minimum rejection. The transition band separates the passband edge from the stopband edge. Phase response and group delay describe timing. The book notes that the windowed-sinc cutoff is defined at 50% amplitude, while Chebyshev/Butterworth cutoffs are usually −3 dB; comparing filters requires using the same definition.`,
        formulas: [
          { label: 'Decibels', tex: 'A_{\\mathrm{dB}}=20\\log_{10}\\left(\\frac{|H|}{|H_{\\mathrm{ref}}|}\\right)', vars: 'Amplitude ratio to dB' },
          { label: 'First-order roll-off', tex: '\\approx 6\\ \\mathrm{dB/octave}\\;(20\\ \\mathrm{dB/decade})', vars: 'One pole' },
        ],
        keyPoints: [
          'Specify passband ripple, stopband attenuation, and transition width together.',
          'Roll-off in dB/octave depends on filter order.',
          'Cutoff conventions differ: −3 dB vs 50% amplitude.',
        ],
        caveat: `A filter can meet a magnitude specification and still fail a time-domain requirement because of phase distortion or overshoot.`,
      },
      {
        id: '14.5', title: 'High-Pass, Band-Pass and Band-Reject Filters', page: 271, level: 'core',
        intuition: `Once you can build a low-pass filter, you can build the other three by subtracting, cascading, or adding responses.`,
        detail: `Spectral inversion turns a low-pass into a high-pass: subtract the low-pass kernel from a delta, $h_{HP}=\\delta-h_{LP}$. Cascading a low-pass and a high-pass produces a band-pass (their passbands overlap); adding a low-pass and a high-pass produces a band-reject (their stopbands overlap). A narrow band-reject is a notch filter. The book’s EEG example separates alpha (7–12 Hz) from beta (17–20 Hz) with a low-pass at 14 Hz and a high-pass obtained by spectral inversion. A telephone tone detector uses a narrow band-pass around the signaling frequency. These constructions work because filtering is linear: responses add or multiply according to the block diagram.`,
        formulas: [
          { label: 'Spectral inversion', tex: 'h_{HP}[n]=\\delta[n]-h_{LP}[n]', vars: 'Low-pass → high-pass' },
          { label: 'Band-pass by cascade', tex: 'H_{BP}(f)=H_{LP}(f)\\,H_{HP}(f)', vars: 'Multiply magnitude responses' },
        ],
        keyPoints: [
          'High-pass = delta − low-pass (spectral inversion).',
          'Band-pass = low-pass × high-pass; band-reject = low-pass + high-pass.',
          'Spectral inversion preserves linear phase if the original filter is symmetric.',
        ],
        application: `EEG band separation, telephone DTMF detection, mains-hum notches, and audio crossovers.`,
      },
      {
        id: '14.6', title: 'Filter Classification', page: 274, level: 'core',
        intuition: `Filters come in families: FIR or IIR, recursive or not, linear phase or minimum phase. Each family has a distinctive cost and behavior.`,
        detail: `Finite impulse response (FIR) filters have a finite kernel and are usually implemented by convolution; they can be exactly linear phase and are always stable. Infinite impulse response (IIR) filters use feedback, have impulse responses that decay forever, and achieve sharp responses with few coefficients—but they can be unstable and usually have nonlinear phase. Recursive filters are IIR by definition; nonrecursive filters are FIR. Minimum-phase filters concentrate energy near the start of the impulse response and have the least delay for a given magnitude response, at the cost of phase distortion. The book also distinguishes analog and digital filters, and fixed-point versus floating-point implementations. A complete specification states the response type, cutoff, ripple, attenuation, transition width, phase requirement, and implementation constraints.`,
        keyPoints: [
          'FIR: finite kernel, convolution, stable, can be linear phase.',
          'IIR: feedback, efficient, potentially unstable, usually nonlinear phase.',
          'Minimum phase minimizes delay but distorts phase.',
          'Choose the family from the application’s time/frequency priorities.',
        ],
        application: `Linear-phase FIR for image and pulse processing; efficient IIR for audio equalizers and low-power embedded filters.`,
      },
    ],
    labs: [{
      id: 'filter-intro',
      title: 'The filter design trade space',
      intro: 'Choose low-pass, high-pass, band-pass, or band-reject, then adjust cutoff, order, and ripple. Compare the magnitude response, step response, and group delay.',
      tasks: [
        'Design a sharp low-pass and inspect its step response. Where does the ringing come from?',
        'Switch to a linear-phase FIR. Compare the step response with the IIR version.',
        'Use spectral inversion to turn the low-pass into a high-pass. Does the magnitude response mirror correctly?',
      ],
    }],
    worked: {
      title: 'Specify a filter from the information, not the curve',
      problem: 'An EKG signal occupies 0.5–40 Hz and must be sampled at 200 Hz. A 50 Hz mains interference is present. Should you use a sharp Chebyshev low-pass at 40 Hz, or a gentler Bessel filter? What about a notch at 50 Hz?',
      steps: [
        { title: 'Identify the encoding', text: 'EKG information is in the waveform shape and timing of QRS complexes—time-domain encoding.' },
        { title: 'Evaluate the Chebyshev', text: 'A sharp Chebyshev would remove 50 Hz but ring and overshoot at the QRS edges, distorting the diagnostic shape.' },
        { title: 'Evaluate the Bessel', text: 'A Bessel filter has gentle phase distortion and little overshoot, preserving edge shape, but its slow roll-off may not sufficiently reject 50 Hz.' },
        { title: 'Combine strategies', text: 'Use a Bessel anti-alias/low-pass for the signal band and a narrow notch at 50 Hz for the interference. Check that the notch does not remove important content near 50 Hz.' },
      ],
      answer: 'Prefer a Bessel low-pass for waveform fidelity, plus a notch at 50 Hz for mains interference. A sharp Chebyshev alone trades diagnostic shape for stopband steepness—a poor trade for time-domain information.',
    },
    misconceptions: [
      { wrong: 'A steeper filter is always better.', right: 'Steep magnitude roll-off usually means more ringing, overshoot, and phase distortion. For time-domain signals, a gentler filter can be superior.' },
      { wrong: 'Cutoff frequency has a universal definition.', right: 'Windowed-sinc filters often use the 50% amplitude point; Butterworth/Chebyshev use −3 dB. Compare like with like.' },
      { wrong: 'IIR filters are always unstable.', right: 'Well-designed IIR filters are stable. Stability must be checked, especially with coefficient quantization and high order.' },
    ],
    takeaways: [
      'Filter design starts with how information is encoded, not with a desired curve.',
      'Time-domain parameters (rise time, overshoot, group delay) matter as much as magnitude.',
      'Spectral inversion and cascade/parallel combinations build all four response types.',
      'FIR/IIR, linear/minimum phase, and fixed/floating point are distinct design choices.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'Which filter is generally best for preserving the shape of an EKG pulse?',
        options: ['A high-order Chebyshev low-pass', 'A Bessel low-pass', 'A narrow band-reject filter at the heart rate', 'A moving average with a very long window'],
        answer: 1,
        explanation: 'Bessel filters have near-linear phase and little overshoot, preserving pulse shape. Chebyshev filters ring; long moving averages smear the pulse.',
        wrongHints: { 0: 'Chebyshev’s sharp cutoff comes with phase distortion and overshoot.', 2: 'Removing the heart-rate frequency would remove the signal itself.', 3: 'A long moving average blurs the QRS complex.' },
      },
      {
        type: 'mcq', question: 'A high-pass filter can be obtained from a low-pass kernel h_LP by:',
        options: ['convolving it with itself', 'spectral inversion: δ − h_LP', 'multiplying by a ramp', 'taking its absolute value'],
        answer: 1,
        explanation: 'Subtracting the low-pass response from an all-pass delta flips the passband and stopband, producing a high-pass response.',
        wrongHints: { 0: 'Self-convolution squares the response; it does not invert it.', 2: 'A ramp changes the time weighting, not the passband/stopband relationship.', 3: 'Absolute value is nonlinear and destroys the filter response.' },
      },
      {
        type: 'tf', question: 'An FIR filter implemented by convolution is always stable.',
        options: ['True', 'False'], answer: 0,
        explanation: 'A finite impulse response has no feedback. For bounded input, the output is bounded by the sum of absolute kernel values times the input bound, so it is stable.',
      },
    ],
  },

  {
    number: 15,
    title: 'Moving Average Filters',
    part: 'Digital Filters',
    tagline: 'The simplest filter, and the optimal one for a very common tradeoff.',
    intro: `The moving average filter replaces each sample with the average of a window around it. It is the first filter most people try, and—surprisingly—it is optimal for reducing white noise while preserving the sharpest possible step response. It is also a poor low-pass filter in the frequency domain.

This chapter explains the convolution kernel, the noise-versus-edge tradeoff, the sinc-shaped frequency response, useful relatives, and the recursive implementation that makes the moving average the fastest digital filter available.`,
    objectives: [
      'Implement a moving average by convolution and recursion.',
      'Quantify noise reduction versus step-response blur.',
      'Interpret the sinc-like frequency response and its limitations.',
      'Compare multiple-pass, Gaussian, and Blackman-window relatives.',
    ],
    prerequisites: [6, 7],
    sections: [
      {
        id: '15.1', title: 'Implementation by Convolution', page: 277, level: 'core',
        intuition: `A moving average is convolution with a rectangle of height 1/M. Each output is the mean of the last M input samples (or a symmetric window).`,
        detail: `The M-point moving average kernel is $h[j]=1/M$ for $j=0,\\ldots,M-1$ and zero elsewhere. Convolving $x$ with this kernel averages M adjacent samples. If the window is one-sided, the output is delayed by $(M-1)/2$ samples relative to the input; if symmetric, the delay is zero but the filter is noncausal and needs future samples. The kernel sums to one, so DC gain is unity. The output length is $N+M-1$ before cropping. The book’s program uses a straightforward sum over M points, which costs M operations per output; the recursive version reduces this to two operations.`,
        formulas: [
          { label: 'Moving average kernel', tex: 'h[j]=\\frac{1}{M},\\quad j=0,\\ldots,M-1', vars: 'M = window length' },
          { label: 'Output', tex: 'y[n]=\\frac{1}{M}\\sum_{j=0}^{M-1}x[n-j]', vars: 'Causal one-sided form' },
          { label: 'Causal group delay', tex: '\\frac{M-1}{2}\\ \\text{samples}', vars: 'One-sided window' },
        ],
        keyPoints: [
          'Kernel is a normalized rectangle; DC gain is one.',
          'One-sided averaging introduces a delay of (M−1)/2 samples.',
          'Direct convolution costs M operations per output.',
        ],
      },
      {
        id: '15.2', title: 'Noise Reduction vs. Step Response', page: 278, level: 'core',
        intuition: `Averaging M independent noise samples reduces the noise by √M, but it also smears an edge over M samples. You can trade one for the other, but not eliminate both.`,
        detail: `For white noise with standard deviation $\\sigma$, averaging M samples reduces the output noise to $\\sigma/\\sqrt{M}$ (assuming independence). A 100-point average reduces noise by a factor of 10. At the same time, a step edge becomes a ramp of width M samples, so the filter blurs exactly the feature many time-domain applications care about. The book proves that, for a fixed 0%–100% rise time, the moving average produces the lowest output noise among linear filters: since every input sample is equally noisy, every coefficient should be equal. Relatives with tapered kernels can win under a 10%–90% rise-time definition, but the practical tradeoff is similar.`,
        formulas: [
          { label: 'White-noise reduction', tex: '\\sigma_y=\\frac{\\sigma_x}{\\sqrt{M}}', vars: 'Independent samples' },
          { label: 'Step-response width', tex: 't_r \\approx M\\ \\text{samples}', vars: '0% to 100% for one-sided averaging' },
        ],
        keyPoints: [
          'Noise falls as 1/√M; edge width grows as M.',
          'The moving average is optimal for white noise at a fixed 0–100% rise time.',
          'Tapered windows improve stopband behavior without changing the basic time-domain tradeoff much.',
        ],
        caveat: `The √M result assumes independent, identically distributed noise. Correlated noise (e.g., hum or drift) is not reduced by simple averaging the same way.`,
        application: `Smoothing sensor readings, reducing random noise on a pulse, and pre-averaging before decimation.`,
      },
      {
        id: '15.3', title: 'Frequency Response', page: 280, level: 'core',
        intuition: `The moving average’s frequency response is a sinc: it passes DC, has its first zero at 1/M cycles/sample, and then ripples with poor attenuation. It is a gentle smoother, not a sharp low-pass.`,
        detail: `The M-point moving average has $H(f)=\\frac{\\sin(\\pi f M)}{M\\sin(\\pi f)}$ for $f\\ne0$, with $H(0)=1$. The first zero is at $f=1/M$ cycles/sample. The sidelobes are only about −13 dB, and the roll-off is slow (first-order-like in the passband, with 20 dB/decade asymptotic). The −3 dB cutoff is approximately $0.443/M$ cycles/sample. Increasing M narrows the passband and improves noise reduction, but also lengthens the step response. The book calls it “an exceptionally good smoothing filter, but an exceptionally bad low-pass filter”: it cannot separate closely spaced bands.`,
        formulas: [
          { label: 'Moving-average response', tex: 'H(f)=\\frac{\\sin(\\pi fM)}{M\\sin(\\pi f)},\\qquad H(0)=1', vars: 'f in cycles/sample' },
          { label: 'First zero', tex: 'f_0=\\frac{1}{M}', vars: 'Cycles per sample' },
          { label: 'Approximate −3 dB cutoff', tex: 'f_c\\approx\\frac{0.443}{M}', vars: 'For large M' },
        ],
        keyPoints: [
          'Sinc-shaped magnitude with first zero at 1/M.',
          'Poor stopband attenuation (first sidelobe ≈ −13 dB) and slow roll-off.',
          'Narrower passband requires a longer window and more edge blur.',
        ],
        application: `Simple anti-alias pre-filtering before decimation, where the signal is oversampled and a sharp cutoff is unnecessary.`,
      },
      {
        id: '15.4', title: 'Relatives of the Moving Average Filter', page: 280, level: 'support',
        intuition: `Pass the signal through a moving average twice and you get a triangular kernel; four times and it looks Gaussian. The frequency response improves, but the cost grows.`,
        detail: `Multiple-pass moving averages convolve the rectangular kernel with itself. Two passes give a triangular kernel; four or more passes approximate a Gaussian (by the central limit theorem). The frequency response is the single-pass response raised to the number of passes, so stopband attenuation improves and the transition band widens. A true Gaussian kernel has a Gaussian frequency response and excellent smoothing, while a Blackman window kernel has much lower sidelobes than a rectangle. These relatives are better for mixed time/frequency-domain problems such as video, where both edge shape and spectral leakage matter. Their disadvantage is that they require convolution (or multiple recursive passes), making them slower than the recursive moving average.`,
        keyPoints: [
          'Two passes → triangular kernel; many passes → approximately Gaussian.',
          'Multiple passes improve stopband attenuation but widen the transition.',
          'Gaussian and Blackman kernels have much lower sidelobes than a rectangle.',
          'All relatives share the same basic noise-versus-rise-time tradeoff.',
        ],
        application: `Video smoothing, image blur, and pre-processing where spectral leakage matters more than sharp cutoff.`,
      },
      {
        id: '15.5', title: 'Recursive Implementation', page: 282, level: 'core',
        intuition: `Instead of re-adding M samples every time, keep a running sum: add the new sample and subtract the one that just left the window. Two operations per output, regardless of M.`,
        detail: `For a symmetric M-point average, the recursive form is $y[i]=y[i-1]+\\frac{x[i+p]-x[i-q]}{M}$, where $p=(M-1)/2$ and $q=p+1$. The first output must be computed by a direct sum to initialize the running total. After that, each output costs one addition and one subtraction. This makes the moving average the fastest digital filter available—O(1) per sample, independent of M. Practical cautions: integer accumulators can overflow; floating-point running sums can drift over long records; and the recursion assumes the window length is constant. The book notes that the recursive form is mathematically identical to convolution but numerically different.`,
        formulas: [
          { label: 'Recursive moving average', tex: 'y[i]=y[i-1]+\\frac{x[i+p]-x[i-q]}{M}', vars: 'p=(M−1)/2, q=p+1' },
          { label: 'Cost per output', tex: 'O(1)', vars: 'Independent of window length' },
        ],
        keyPoints: [
          'Running-sum recursion reduces cost from O(M) to O(1) per sample.',
          'Initialize with a direct sum of the first window.',
          'Watch overflow and long-term round-off drift.',
        ],
        caveat: `The recursion is only equivalent to the moving average if the window length and indexing are correct. Off-by-one errors produce a subtly wrong filter.`,
        application: `Real-time sensor smoothing on microcontrollers, where a long window would otherwise be too expensive.`,
      },
    ],
    labs: [{
      id: 'moving-average',
      title: 'Noise versus edge sharpness',
      intro: 'Add white noise to a pulse and filter it with moving averages of different lengths. Measure the output noise and the 0–100% rise time, then compare the sinc-shaped frequency response.',
      tasks: [
        'Double M. By what factor does the noise standard deviation fall? What happens to the edge width?',
        'Switch to two passes. Compare the kernel, step response, and stopband attenuation.',
        'Use the recursive implementation and verify that it matches direct convolution.',
      ],
    }],
    worked: {
      title: 'Choose a moving-average length',
      problem: 'A sensor signal has white noise with σ=0.2 V and a step feature that must settle within 20 samples. What moving-average length keeps the 0–100% rise time within 20 samples, and what noise reduction does it achieve?',
      steps: [
        { title: 'Relate window length to rise time', text: 'For a one-sided M-point average, the 0–100% rise time is about M samples.' },
        { title: 'Choose M', text: 'Set M=20 to keep the rise time at 20 samples. Any longer window would exceed the requirement.' },
        { title: 'Compute noise reduction', text: '$\\sigma_y=0.2/\\sqrt{20}\\approx0.0447$ V.' },
        { title: 'Check the frequency tradeoff', text: 'The first spectral zero is at 1/20=0.05 cycles/sample. If interference lies near that frequency or beyond, the moving average’s poor stopband attenuation may be inadequate; a windowed-sinc would be better.' },
      ],
      answer: 'Use M=20. Output noise falls to about 0.045 V, and the edge smears over about 20 samples. If sharp frequency separation is also required, replace the moving average with a windowed-sinc design.',
    },
    misconceptions: [
      { wrong: 'The moving average is a good low-pass filter because it smooths.', right: 'It is a good *smoother* (time domain) but a poor low-pass (frequency domain): slow roll-off and only −13 dB sidelobes.' },
      { wrong: 'A longer moving average always improves the result.', right: 'Longer windows reduce noise but blur edges and delay the output. The right length depends on the required rise time.' },
      { wrong: 'The recursive implementation is an approximation.', right: 'It is mathematically equivalent to the moving-average convolution (apart from numerical round-off) and is exact in exact arithmetic.' },
    ],
    takeaways: [
      'Moving average = convolution with a normalized rectangle.',
      'Noise falls as 1/√M while edge width grows as M; it is optimal for white noise at fixed 0–100% rise time.',
      'Frequency response is sinc-like with first zero at 1/M and poor sidelobes.',
      'Multiple passes, Gaussian, and Blackman kernels improve stopband behavior at extra cost.',
      'The running-sum recursion makes it O(1) per sample—the fastest digital filter.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'A 64-point moving average reduces white noise by a factor of about:',
        options: ['2', '8', '32', '64'],
        answer: 1,
        explanation: 'Noise standard deviation falls as 1/√M = 1/√64 = 1/8, a factor of 8.',
        wrongHints: { 0: 'A factor of 2 corresponds to M=4.', 2: 'A factor of 32 would require M=1024.', 3: 'Noise power, not standard deviation, would scale as 1/M; the amplitude factor is √M.' },
      },
      {
        type: 'mcq', question: 'The first zero in the frequency response of an M-point moving average occurs at:',
        options: ['f = M', 'f = 1/M cycles/sample', 'f = 0.5', 'f = 0.443/M'],
        answer: 1,
        explanation: 'The sinc numerator sin(πfM) is zero when fM=1, i.e., f=1/M cycles/sample. The −3 dB point is near 0.443/M.',
        wrongHints: { 0: 'M is a length, not a normalized frequency.', 2: 'Nyquist is 0.5, independent of M.', 3: '0.443/M is the approximate −3 dB cutoff, not the first zero.' },
      },
      {
        type: 'tf', question: 'The recursive moving-average implementation requires work proportional to the window length for every output sample.',
        options: ['True', 'False'], answer: 1,
        explanation: 'The running-sum recursion uses one addition and one subtraction per output, independent of M—O(1).',
      },
    ],
  },

  {
    number: 16,
    title: 'Windowed-Sinc Filters',
    part: 'Digital Filters',
    tagline: 'Near-ideal frequency selectivity, paid for in time-domain ringing.',
    intro: `The ideal low-pass filter has a rectangular frequency response, whose impulse response is a sinc that extends forever. A windowed-sinc filter truncates that sinc and tapers it with a smooth window, producing a practical FIR filter with excellent stopband attenuation and linear phase.

The tradeoff is explicit: the longer the kernel, the sharper the transition; the better the window, the deeper the stopband; and the more ideal the frequency response, the worse the step response. This chapter shows how to design these filters, how to build high-pass and band-pass versions by spectral inversion, and how far the method can be pushed.`,
    objectives: [
      'Derive the windowed-sinc kernel from the ideal low-pass response.',
      'Choose cutoff, kernel length, and window for a target transition width and attenuation.',
      'Build high-pass and band-pass filters by spectral inversion.',
      'Explain the time-domain cost and numerical limits of the method.',
    ],
    prerequisites: [11, 14, 15],
    sections: [
      {
        id: '16.1', title: 'Strategy of the Windowed-Sinc', page: 285, level: 'core',
        intuition: `Start with the perfect low-pass shape (a rectangle in frequency). Its inverse transform is a sinc. Cut the sinc short, taper the cut with a window, and you have a real filter.`,
        detail: `The ideal low-pass response is 1 below $f_c$ and 0 above. Its inverse discrete-time Fourier transform is $h[i]=2f_c\\,\\mathrm{sinc}(2f_c i)$, which is noncausal and infinite. Truncating it to $M+1$ points produces ripple and finite stopband attenuation—the Gibbs effect. Multiplying the truncated sinc by a smooth window (Hamming, Blackman, etc.) tapers the endpoints and dramatically reduces ripple, at the cost of a wider transition band. The resulting kernel is symmetric, so the filter has exactly linear phase and a constant group delay of $M/2$ samples. The cutoff is defined at the 50% amplitude point because the windowed-sinc response is symmetric between passband and stopband.`,
        formulas: [
          { label: 'Ideal low-pass kernel', tex: 'h[i]=2f_c\\,\\mathrm{sinc}(2f_c i)', vars: 'f_c = cutoff as a fraction of f_s' },
          { label: 'Blackman window', tex: 'w[i]=0.42-0.5\\cos\\!\\left(\\frac{2\\pi i}{M}\\right)+0.08\\cos\\!\\left(\\frac{4\\pi i}{M}\\right)', vars: 'i=0…M, M even' },
        ],
        keyPoints: [
          'Ideal rectangle ↔ infinite sinc.',
          'Truncation causes Gibbs ripple; a window tapers it.',
          'Symmetric kernel → linear phase, constant delay M/2.',
          'Cutoff is the 50% amplitude point for windowed-sinc.',
        ],
        caveat: `The window does not eliminate the time-domain ringing; it redistributes it. A sharper frequency response always costs step-response overshoot.`,
      },
      {
        id: '16.2', title: 'Designing the Filter', page: 288, level: 'core',
        intuition: `Two numbers set the design: cutoff frequency and kernel length. The length controls transition width; the window controls stopband depth.`,
        detail: `Choose $f_c$ between 0 and 0.5 (fraction of sampling rate) and an even kernel order $M$. The transition bandwidth is approximately $BW\\approx4/M$ for a Blackman window, so $M\\approx4/BW$. The kernel is $h[i]=K\\sin(2\\pi f_c(i-M/2))/(\\pi(i-M/2))\\cdot w[i]$, with the special value $h[M/2]=2f_cK$ at the center, and $K$ chosen so the sum is one. The Blackman window gives about −74 dB stopband attenuation and 0.02% passband ripple; Hamming gives about −53 dB and 0.2% ripple but a 20% faster roll-off. The cutoff is at half amplitude, and the step response overshoots and rings. The book recommends Blackman as the default because stopband attenuation is usually harder to fix than a slightly slower roll-off.`,
        formulas: [
          { label: 'Length vs. transition width', tex: 'M \\approx \\frac{4}{BW}', vars: 'BW as a fraction of f_s; Blackman approximation' },
          { label: 'Windowed-sinc kernel', tex: 'h[i]=K\\,\\frac{\\sin(2\\pi f_c(i-M/2))}{\\pi(i-M/2)}\\,w[i]', vars: 'Normalize Σh[i]=1; center uses 2f_cK' },
          { label: 'DC normalization', tex: 'K=\\frac{1}{\\sum_i \\mathrm{sinc\\,term}_i\\,w[i]}', vars: 'Ensure unity gain at DC' },
        ],
        keyPoints: [
          'M ≈ 4/BW for a Blackman-windowed design.',
          'Normalize the kernel to unity DC gain.',
          'M must be even; the kernel has M+1 points.',
          'Center sample needs a special sinc(0)=1 calculation.',
        ],
        caveat: `The M≈4/BW rule is approximate. Always measure the realized transition width and stopband attenuation; window choice and numerical precision shift the result.`,
        application: `Audio anti-aliasing, EEG band separation, and any FIR design needing linear phase and deep stopband attenuation.`,
      },
      {
        id: '16.3', title: 'Examples of Windowed-Sinc Filters', page: 292, level: 'core',
        intuition: `A 101-point low-pass can separate EEG alpha from beta; an 801-point design can isolate a narrow telephone tone. The method scales smoothly from simple to demanding.`,
        detail: `In the book’s EEG example, the signal is sampled at 100 Hz. Alpha is 7–12 Hz and beta is 17–20 Hz. A low-pass at $f_c=0.14$ (14 Hz) with a 0.04 transition bandwidth needs about $M=4/0.04=100$, so a 101-point Hamming-windowed kernel is used. The high-pass version is obtained by spectral inversion. In the telephone-tone example, the signal is sampled at 10 kHz and an 80 Hz band centered at 2 kHz is isolated using two low-pass designs at 0.196 and 0.204, combined into a band-pass by inversion and addition; the 50 Hz transition requires $M\\approx4/0.005=800$, so an 801-point Blackman kernel is used. These examples show that the design method is systematic: translate the specification into $f_c$ and $BW$, choose M and the window, then implement by convolution or FFT.`,
        keyPoints: [
          'EEG: 101-point Hamming low-pass at 0.14 separates alpha from beta.',
          'Narrow band-pass: 801-point Blackman with 0.005 transition width.',
          'High-pass and band-pass are built from low-pass designs by inversion and combination.',
        ],
        application: `Biomedical band separation, DTMF tone detection, audio crossovers, and anti-alias filters.`,
      },
      {
        id: '16.4', title: 'Pushing it to the Limit', page: 293, level: 'advanced',
        intuition: `Need −120 dB stopband? Cascade two windowed-sinc filters. Need a 1 Hz transition at 48 kHz? The kernel becomes thousands of points—and precision becomes the enemy.`,
        detail: `A single Blackman-windowed sinc gives about −74 dB stopband attenuation. Convolving the kernel with itself (equivalently, filtering twice) squares the magnitude response, pushing attenuation to about −148 dB, at the cost of a longer kernel and a wider transition. This is a general trick: cascading identical filters doubles the dB attenuation. Very narrow transition bands require very long kernels, which are expensive by direct convolution and demanding on numerical precision. Floating point is usually needed because the kernel’s tails span a huge dynamic range. Coefficient quantization can raise sidelobes and destroy the stopband. At the extreme, FFT convolution is used to make long kernels practical. The method is robust but not unlimited: precision, memory, and latency eventually dominate.`,
        keyPoints: [
          'Cascading two identical filters squares the magnitude, doubling dB attenuation.',
          'Narrow transitions require long kernels and high numerical precision.',
          'Floating point is preferred; coefficient quantization can ruin the stopband.',
          'FFT convolution makes long kernels practical.',
        ],
        caveat: `Cascading also squares the passband ripple and widens the transition. It is not a free doubling of performance.`,
        application: `High-end audio anti-aliasing, seismic processing, and reference-grade measurement filters.`,
      },
    ],
    labs: [{
      id: 'windowed-sinc',
      title: 'Design a windowed-sinc filter',
      intro: 'Set cutoff, transition width, and window. Inspect the kernel, magnitude response in dB, and step response. Verify the M≈4/BW rule and the 50% cutoff convention.',
      tasks: [
        'Set BW=0.05 and check the recommended M. Measure the actual transition width.',
        'Compare Hamming and Blackman at the same M. Which has deeper stopband? Which rolls off faster?',
        'Cascade the filter with itself. How much does the stopband improve, and what happens to the transition?',
      ],
    }],
    worked: {
      title: 'Design a 1 kHz low-pass at 48 kHz sampling',
      problem: 'Design a Blackman-windowed sinc with a cutoff of 1 kHz and a transition width of 200 Hz at a 48 kHz sampling rate. Estimate the kernel length and the number of coefficients.',
      steps: [
        { title: 'Normalize the frequencies', text: '$f_c=1000/48000=0.02083$ cycles/sample; $BW=200/48000=0.004167$.' },
        { title: 'Estimate M', text: '$M\\approx4/BW=4/0.004167=960$. Choose the nearest even integer, 960.' },
        { title: 'Count coefficients', text: 'An order-M kernel has M+1 = 961 coefficients, symmetric about the center at 480.' },
        { title: 'Check the cost', text: 'Direct convolution costs about 961 multiply–accumulates per output sample—about 46 million per second at 48 kHz. FFT convolution or a decimated implementation would be preferable.' },
      ],
      answer: 'Use M=960 (961 coefficients): cutoff 0.02083, Blackman window, normalized to unity DC gain. The kernel is symmetric, so the filter is linear phase with a delay of 480 samples (10 ms).',
    },
    misconceptions: [
      { wrong: 'A windowed-sinc filter is ideal because it approximates a rectangle.', right: 'It is a practical approximation with finite transition width, finite stopband attenuation, and significant time-domain ringing.' },
      { wrong: 'The cutoff is the −3 dB point.', right: 'For windowed-sinc filters the cutoff is the 50% amplitude point, because the response is symmetric between passband and stopband.' },
      { wrong: 'You can make the transition arbitrarily narrow without cost.', right: 'Transition width scales as 1/M. Narrower transitions require longer kernels, more computation, and greater numerical precision.' },
    ],
    takeaways: [
      'Windowed-sinc = truncated, windowed sinc with linear phase and near-ideal magnitude.',
      'M ≈ 4/BW; Blackman gives deep stopband, Hamming gives faster roll-off.',
      'Cutoff is at 50% amplitude; normalize the kernel for unity DC gain.',
      'High-pass and band-pass are built by spectral inversion and combination.',
      'Cascading improves attenuation but lengthens the kernel and widens the transition.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'For a windowed-sinc filter with transition bandwidth BW=0.02, the approximate kernel order is:',
        options: ['20', '100', '200', '400'],
        answer: 2,
        explanation: 'M ≈ 4/BW = 4/0.02 = 200. The kernel has 201 coefficients.',
        wrongHints: { 0: 'M=20 would give BW≈0.2, ten times wider.', 1: 'M=100 would give BW≈0.04.', 3: 'M=400 would give BW≈0.01, twice as narrow as requested.' },
      },
      {
        type: 'mcq', question: 'Why is the windowed-sinc cutoff defined at 50% amplitude?',
        options: ['Because the filter is always unstable otherwise', 'Because its passband ripple and stopband attenuation are symmetric', 'Because 50% corresponds to −3 dB', 'Because the DFT requires it'],
        answer: 1,
        explanation: 'The windowed-sinc response is symmetric between passband and stopband, so the half-amplitude point is the natural boundary. This also makes spectral inversion exact.',
        wrongHints: { 0: 'Windowed-sinc filters are FIR and stable regardless of cutoff definition.', 2: '50% amplitude is about −6 dB, not −3 dB.', 3: 'The DFT does not dictate the cutoff convention.' },
      },
      {
        type: 'tf', question: 'Cascading two identical windowed-sinc filters doubles the stopband attenuation in dB.',
        options: ['True', 'False'], answer: 0,
        explanation: 'Cascading multiplies the magnitude responses, so the dB attenuation doubles: −74 dB becomes about −148 dB.',
      },
    ],
  },

  {
    number: 17,
    title: 'Custom Filters',
    part: 'Digital Filters',
    tagline: 'When the standard responses are not the shape you need.',
    intro: `Not every filter is a low-pass or high-pass. Sometimes you need an arbitrary magnitude and phase response, the inverse of a known distortion, or the filter that minimizes a specific error. Custom filter design turns a desired response into a kernel or a set of coefficients.

This chapter covers frequency sampling (inverse DFT of a desired response), deconvolution (inverting a known system), and optimal filtering (minimizing mean-squared error). Each method has assumptions and failure modes; the chapter is as much about knowing when not to invert as about how to invert.`,
    objectives: [
      'Design an FIR filter by sampling a desired frequency response.',
      'Explain the risks of inverse filtering and deconvolution.',
      'Describe the Wiener/optimal filter and its tradeoff.',
      'Recognize when a custom design is ill-conditioned.',
    ],
    prerequisites: [8, 9, 14, 16],
    sections: [
      {
        id: '17.1', title: 'Arbitrary Frequency Response', page: 297, level: 'core',
        intuition: `If you can describe the magnitude and phase you want at each frequency, you can inverse-transform that description into a filter kernel.`,
        detail: `Frequency sampling starts with a desired response $H_d[k]$ on an N-point grid, including magnitude and phase. The inverse DFT gives a length-N impulse response. Because the inverse is circular, the kernel wraps around; to get a linear-phase FIR filter, you must specify a linear-phase response or rotate/shift the kernel and window it. Truncating the kernel causes Gibbs ripple, just as in windowed-sinc design. A common approach specifies a zero-phase magnitude, inverse-transforms to a symmetric noncausal kernel, shifts it to be causal, and applies a window. The method can realize differentiators, Hilbert transformers, band-pass shapes, and arbitrary equalization curves, but the resulting filter may be long, and the desired response must be consistent with a real, causal, finite-length system.`,
        formulas: [
          { label: 'Frequency sampling', tex: 'h[n]=\\mathrm{IDFT}\\{H_d[k]\\}', vars: 'Desired response sampled on N bins' },
          { label: 'Linear-phase condition', tex: 'h[n]=h[N-1-n]', vars: 'Symmetric FIR kernel' },
        ],
        keyPoints: [
          'Sample the desired magnitude/phase, inverse DFT, window, and shift.',
          'A symmetric kernel gives linear phase.',
          'Truncation causes ripple; the desired response may not be exactly realizable.',
        ],
        application: `Audio equalizers with arbitrary curves, differentiators, Hilbert transformers, and band shaping.`,
      },
      {
        id: '17.2', title: 'Deconvolution', page: 300, level: 'advanced',
        intuition: `If a signal has been blurred by a known system, can you undo the blur? Sometimes—but the inverse often amplifies noise and can become unstable.`,
        detail: `If $y=x*g$, the naive inverse filter is $H=1/G$, so $\\hat{x}=y*h$ recovers $x$ in the absence of noise. In practice, $G(f)$ may have zeros or very small values, making $1/G$ enormous at those frequencies. Any noise is amplified catastrophically, and the inverse may be noncausal or unstable. Regularization adds a small term to the denominator, $H=G^*/(|G|^2+\\lambda)$, trading exact inversion for noise robustness. The Wiener filter (next section) is the optimal version under a signal/noise spectral model. Deconvolution is used in seismic processing (removing the source wavelet), image restoration (removing lens blur), and audio (removing room response), always with careful attention to noise and conditioning.`,
        formulas: [
          { label: 'Naive inverse filter', tex: 'H(f)=\\frac{1}{G(f)}', vars: 'Valid only where G is well-conditioned' },
          { label: 'Regularized inverse', tex: 'H(f)=\\frac{G^*(f)}{|G(f)|^2+\\lambda}', vars: 'λ controls noise amplification' },
        ],
        keyPoints: [
          'Deconvolution inverts a known blur or channel response.',
          'Zeros/small values in G make the inverse unstable and noise-sensitive.',
          'Regularization trades exactness for robustness.',
        ],
        caveat: `Never invert a measured response without checking its noise floor and condition number. A mathematically exact inverse can be practically useless.`,
        application: `Seismic wavelet deconvolution, image deblurring, room-response correction, and channel equalization.`,
      },
      {
        id: '17.3', title: 'Optimal Filters', page: 307, level: 'advanced',
        intuition: `An optimal filter minimizes a specific error. If the goal is minimum mean-squared error in noise, the Wiener filter is the answer.`,
        detail: `The Wiener filter estimates a desired signal from a noisy observation by minimizing mean-squared error. In the frequency domain, $H(f)=\\frac{S_{xy}(f)}{S_{xx}(f)}$ for the general (possibly noncausal) case, or $H=\\frac{S_{ss}}{S_{ss}+S_{nn}}$ when the desired signal and noise are uncorrelated. It balances signal preservation against noise suppression: where the signal-to-noise ratio is high, $H\\approx1$; where noise dominates, $H\\approx0$. The matched filter is a special case for detecting a known waveform in white noise. Least-squares and adaptive filters (LMS, RLS) extend the idea to unknown or time-varying statistics. Optimality is always relative to a model; if the statistical assumptions are wrong, the “optimal” filter can underperform a simple heuristic.`,
        formulas: [
          { label: 'Wiener filter (uncorrelated signal/noise)', tex: 'H(f)=\\frac{S_{ss}(f)}{S_{ss}(f)+S_{nn}(f)}', vars: 'S_ss = signal PSD, S_nn = noise PSD' },
          { label: 'Matched filter', tex: 'h(t)=s^*(T-t)', vars: 'Maximizes SNR for a known pulse s(t)' },
        ],
        keyPoints: [
          'Optimal filters minimize a stated cost, usually MSE or output SNR.',
          'The Wiener filter suppresses frequencies where noise dominates.',
          'Matched filtering is optimal detection for a known pulse in white noise.',
          'Model mismatch can erase the theoretical advantage.',
        ],
        application: `Channel equalization, noise cancellation, radar detection, and adaptive audio processing.`,
      },
    ],
    labs: [{
      id: 'custom-filter',
      title: 'Draw a response, get a filter',
      intro: 'Paint a desired magnitude response, inverse-transform it into a kernel, and see the realized response after windowing. Then try to invert a blurred signal and watch noise amplification.',
      tasks: [
        'Design a band-pass with two passbands. How does the kernel length affect the sharpness?',
        'Set the desired response to zero in a narrow band and inspect the impulse response.',
        'Increase the deconvolution regularization. At what point does the recovered signal become too smooth?',
      ],
    }],
    worked: {
      title: 'Why a naive inverse filter fails',
      problem: 'A channel has $G(f)=0.01$ at 1 kHz and 1 at other frequencies. The received signal contains noise at 1 kHz. What does the inverse filter $H=1/G$ do to the noise?',
      steps: [
        { title: 'Compute the gain', text: 'At 1 kHz, $H=1/0.01=100$, a 40 dB boost.' },
        { title: 'Apply it to the noise', text: 'Noise at 1 kHz is amplified by 100, while the signal in that band is restored to its original level.' },
        { title: 'Compare signal and noise', text: 'If the received signal-to-noise ratio at 1 kHz was 20 dB before inversion, it becomes 20−40=−20 dB after inversion. The noise now dominates.' },
        { title: 'Regularize', text: 'Use $H=G^*/(|G|^2+\\lambda)$. With λ=0.001, the 1 kHz gain is about 0.01/(0.0001+0.001)≈9.1 instead of 100, limiting noise amplification at the cost of imperfect restoration.' },
      ],
      answer: 'The naive inverse boosts 1 kHz noise by 40 dB. A regularized inverse or Wiener filter limits the boost and preserves usable signal-to-noise ratio, accepting some residual blur.',
    },
    misconceptions: [
      { wrong: 'Deconvolution can always recover the original signal exactly.', right: 'Noise, missing frequencies, and ill-conditioning make exact recovery impossible in practice. Regularization is usually required.' },
      { wrong: 'An optimal filter is best for every signal.', right: 'Optimality depends on the assumed signal and noise statistics. Model mismatch can make it worse than a simple filter.' },
      { wrong: 'Frequency sampling gives an arbitrary response exactly.', right: 'The realized FIR response is a windowed, truncated approximation. Sharp features ring and may not be realizable with a short kernel.' },
    ],
    takeaways: [
      'Frequency sampling realizes custom magnitude/phase shapes but inherits truncation effects.',
      'Inverse filtering amplifies noise wherever the channel response is small.',
      'Regularization and Wiener filtering trade exactness for robustness.',
      'Optimality is model-dependent; validate assumptions on real data.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'The main danger of a naive inverse filter H=1/G is:',
        options: ['It always makes the signal quieter', 'It amplifies noise where G is small', 'It changes the sampling rate', 'It makes the filter nonlinear'],
        answer: 1,
        explanation: 'Where G(f) is small, 1/G(f) is huge, boosting both the signal and any noise in that band. The result can be dominated by amplified noise.',
        wrongHints: { 0: 'The inverse may boost gain, not reduce it.', 2: 'Filtering does not change the sampling rate.', 3: 'H=1/G is a linear filter; the problem is conditioning, not linearity.' },
      },
      {
        type: 'mcq', question: 'The Wiener filter suppresses frequencies where:',
        options: ['the signal is strong', 'the noise dominates the signal', 'the phase is zero', 'the sampling rate is highest'],
        answer: 1,
        explanation: 'The Wiener gain S_ss/(S_ss+S_nn) approaches zero when noise power dominates, and approaches one when signal power dominates.',
        wrongHints: { 0: 'Strong signal regions are passed with gain near one.', 2: 'Phase does not determine the magnitude weighting.', 3: 'Frequency response is independent of the sampling-rate axis scaling.' },
      },
      {
        type: 'tf', question: 'A matched filter maximizes output signal-to-noise ratio for a known pulse in white noise.',
        options: ['True', 'False'], answer: 0,
        explanation: 'The matched filter is the time-reversed conjugate of the known pulse; it is the optimal linear detector for that signal in additive white Gaussian noise.',
      },
    ],
  },

  {
    number: 18,
    title: 'FFT Convolution',
    part: 'Digital Filters',
    tagline: 'Making long FIR filters practical by moving convolution into the frequency domain.',
    intro: `A long FIR filter is expensive by direct convolution: every output requires one multiply per coefficient. FFT convolution replaces that with a few transforms and pointwise multiplications, reducing the cost from O(NM) to O(N log N). The price is latency, memory, and the need to handle block boundaries carefully.

This chapter explains overlap-add, the FFT convolution procedure, zero padding, and the speed tradeoffs. It is the practical bridge between the Fourier theory of Chapter 9 and the FIR filters of Chapters 15–17.`,
    objectives: [
      'Implement overlap-add convolution correctly.',
      'Perform linear convolution with zero-padded FFTs.',
      'Choose block size and method based on latency and cost.',
      'Recognize circular wraparound and scaling errors.',
    ],
    prerequisites: [9, 12, 16],
    sections: [
      {
        id: '18.1', title: 'The Overlap-Add Method', page: 311, level: 'core',
        intuition: `Break a long input into blocks, convolve each block with the filter, and add the overlapping tails. The result is exactly the same as convolving the whole signal at once.`,
        detail: `Partition the input into blocks of length L. Convolve each block with the length-M kernel, producing L+M−1 samples. The first M−1 samples of each block’s output overlap the previous block’s tail; add them. The final output is the sum of all shifted block convolutions. Overlap-add is exact for any block size, but the block size affects efficiency and latency. If the FFT is used for each block, the transform length must be at least L+M−1 (usually the next power of two). The method works for streaming data: process one block at a time, keep the tail, and output completed samples.`,
        formulas: [
          { label: 'Block output length', tex: 'L+M-1', vars: 'L = block length, M = kernel length' },
          { label: 'Overlap', tex: 'M-1\\ \\text{samples}', vars: 'Tail added to the next block' },
        ],
        keyPoints: [
          'Partition input, convolve each block, add overlapping tails.',
          'Exact for any block size; no approximation.',
          'Block size trades latency against transform efficiency.',
        ],
      },
      {
        id: '18.2', title: 'FFT Convolution', page: 312, level: 'core',
        intuition: `Transform each block and the kernel, multiply point by point, and inverse-transform. The FFT does the convolution implicitly—if you zero-pad enough to avoid wraparound.`,
        detail: `To convolve a block of length L with a kernel of length M using the DFT, choose an FFT length $N\\ge L+M-1$, zero-pad both sequences to N, compute their FFTs, multiply bin by bin, and inverse-transform. The first L+M−1 output samples are the linear convolution of the block; the rest should be zero (apart from round-off). Combine blocks with overlap-add. Because the kernel is fixed, its FFT can be precomputed. For real signals, a real FFT halves the work. Scaling conventions must be consistent: if the inverse FFT does not divide by N, apply the factor explicitly.`,
        formulas: [
          { label: 'FFT convolution', tex: 'y=\\mathrm{IFFT}\\{\\mathrm{FFT}(x)\\cdot\\mathrm{FFT}(h)\\}', vars: 'Zero-pad to N ≥ L+M−1' },
          { label: 'Minimum FFT length', tex: 'N\\ge L+M-1', vars: 'Next power of two is common' },
        ],
        keyPoints: [
          'Zero-pad to at least L+M−1 before transforming.',
          'Precompute the kernel FFT for repeated blocks.',
          'Use overlap-add to stitch blocks into a continuous output.',
        ],
        caveat: `If N is too small, the convolution wraps around and corrupts the beginning of each block. This is the most common FFT-convolution bug.`,
      },
      {
        id: '18.3', title: 'Speed Improvements', page: 316, level: 'advanced',
        intuition: `FFT convolution wins when the kernel is long. For short kernels, direct convolution is simpler and faster. The best block size balances transform overhead against latency.`,
        detail: `The cost per output sample for FFT convolution is roughly $O(\\log N)$ plus overhead, while direct convolution is $O(M)$. The crossover depends on M, N, hardware, and whether the kernel FFT is precomputed. Large blocks amortize the transform overhead but increase latency; real-time systems often use partitioned convolution, where the kernel is split into segments and each segment is convolved with a smaller block. Overlap-save is an alternative to overlap-add that discards corrupted output samples instead of adding tails. Frequency-domain filtering can also be more efficient for multi-channel or time-varying filters if the transform is shared. The chapter emphasizes measuring actual performance rather than relying on asymptotic formulas.`,
        keyPoints: [
          'FFT convolution wins for long kernels; direct wins for short kernels.',
          'Larger blocks improve efficiency but increase latency.',
          'Partitioned convolution enables low-latency real-time processing.',
          'Overlap-save is an alternative to overlap-add.',
        ],
        application: `Long reverb impulses, room correction, image convolution with large kernels, and real-time FIR filtering.`,
      },
    ],
    labs: [{
      id: 'fft-convolution',
      title: 'Overlap-add, block by block',
      intro: 'Convolve a long signal with a long kernel using FFT blocks. Step through the blocks, see the overlapping tails, and compare the result with direct convolution.',
      tasks: [
        'Set the FFT length below L+M−1. Locate the wraparound error.',
        'Increase the block size. How does the latency change?',
        'Compare direct and FFT convolution timings for short and long kernels.',
      ],
    }],
    worked: {
      title: 'Choose an FFT length',
      problem: 'A streaming FIR filter uses blocks of 256 samples and a kernel of 100 samples. What is the minimum FFT length for linear convolution, and what power of two would you choose?',
      steps: [
        { title: 'Apply the linear-convolution condition', text: '$N\\ge L+M-1=256+100-1=355$.' },
        { title: 'Choose a power of two', text: 'The next power of two is 512. This wastes some samples but allows a radix-2 FFT.' },
        { title: 'Check the zero padding', text: 'Pad the 256-sample block and 100-sample kernel to 512. The valid output is the first 355 samples.' },
        { title: 'Assess latency', text: 'A 256-sample block at 48 kHz is 5.33 ms, plus transform and buffering time. If lower latency is required, reduce the block size or use partitioned convolution.' },
      ],
      answer: 'Minimum N=355; use N=512 for a radix-2 FFT. The block latency is about 5.3 ms at 48 kHz, which may be acceptable for music but too high for live monitoring.',
    },
    misconceptions: [
      { wrong: 'FFT convolution is always faster than direct convolution.', right: 'For short kernels, FFT overhead dominates. Direct convolution can be faster and simpler.' },
      { wrong: 'You can use any FFT length as long as it is a power of two.', right: 'It must be at least L+M−1 to avoid circular wraparound. A power of two is a convenience, not a substitute for the length condition.' },
      { wrong: 'Overlap-add changes the result because it processes blocks separately.', right: 'Overlap-add is mathematically exact; the sum of overlapping block convolutions equals the full linear convolution.' },
    ],
    takeaways: [
      'Overlap-add partitions a long convolution into exact block convolutions.',
      'FFT convolution requires N ≥ L+M−1 to avoid wraparound.',
      'Precompute the kernel FFT and stitch blocks with overlap-add.',
      'Choose block size by balancing efficiency and latency; direct convolution may win for short kernels.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'A block of 128 samples is convolved with a 64-sample kernel. What is the minimum FFT length for linear convolution?',
        options: ['128', '191', '192', '256'],
        answer: 1,
        explanation: 'N ≥ L+M−1 = 128+64−1 = 191. A power of two such as 256 is often chosen, but 191 is the minimum.',
        wrongHints: { 0: '128 would wrap the tail into the beginning.', 2: '192 is one more than necessary but still valid; 191 is the minimum.', 3: '256 is convenient but not the minimum.' },
      },
      {
        type: 'mcq', question: 'Overlap-add adds the last M−1 samples of each block’s convolution to:',
        options: ['the previous block’s beginning', 'the next block’s beginning', 'the kernel', 'the frequency-domain spectrum'],
        answer: 1,
        explanation: 'The tail of each block overlaps the first M−1 samples of the next block, so it is added there.',
        wrongHints: { 0: 'The tail extends forward in time, not backward.', 2: 'The kernel is fixed; it is not modified by overlap-add.', 3: 'Overlap-add is a time-domain stitching operation.' },
      },
      {
        type: 'tf', question: 'Partitioned convolution can reduce latency compared with a single large FFT block.',
        options: ['True', 'False'], answer: 0,
        explanation: 'Splitting the kernel into segments allows the system to output samples sooner, at the cost of more transforms. This is standard in real-time convolution reverb.',
      },
    ],
  },

  {
    number: 19,
    title: 'Recursive Filters',
    part: 'Digital Filters',
    tagline: 'Feedback buys efficiency, at the cost of phase and stability.',
    intro: `A recursive filter computes each output from past inputs *and past outputs*. That feedback lets a few coefficients produce a long, decaying impulse response—an infinite impulse response (IIR)—at a tiny computational cost. The tradeoffs are nonlinear phase, potential instability, and sensitivity to coefficient precision.

This chapter starts with the difference equation, derives the single-pole low-pass and high-pass filters, explains time constant and cutoff, examines narrow-band designs, phase response, and fixed-point implementation. It is the practical introduction to the IIR family.`,
    objectives: [
      'Write and implement a recursive difference equation.',
      'Design single-pole low-pass and high-pass filters.',
      'Relate the decay parameter to time constant and cutoff frequency.',
      'Explain phase distortion and stability limitations.',
      'Recognize fixed-point overflow and limit-cycle risks.',
    ],
    prerequisites: [14, 15],
    sections: [
      {
        id: '19.1', title: 'The Recursive Method', page: 319, level: 'core',
        intuition: `Instead of convolving with a long kernel, a recursive filter reuses its own past outputs. One multiply and one add can produce an impulse response that decays for hundreds of samples.`,
        detail: `A general recursive filter is $y[n]=\\sum_{k=0}^{P}a_k x[n-k]-\\sum_{k=1}^{Q}b_k y[n-k]$, with $a_0$ usually normalized to one. The output depends on previous outputs, so the impulse response is generally infinite. A single pole $y[n]=a_0x[n]+b_1y[n-1]$ produces an exponential decay; cascading poles produces a smoother, longer response. Recursive filters are efficient because each output costs a few operations regardless of the impulse-response length. The book notes that they are also called IIR filters, and that their design is less flexible than FIR: phase is nonlinear, stability must be checked, and high-order designs are sensitive to coefficient quantization.`,
        formulas: [
          { label: 'Recursive difference equation', tex: 'y[n]=\\sum_{k=0}^{P}a_k x[n-k]-\\sum_{k=1}^{Q}b_k y[n-k]', vars: 'Feedback coefficients b_k' },
          { label: 'Single pole', tex: 'y[n]=a_0x[n]+b_1y[n-1]', vars: 'Impulse response ∝ b₁ⁿ' },
        ],
        keyPoints: [
          'Recursive = output depends on past outputs → IIR.',
          'Cost per sample is independent of impulse-response length.',
          'Feedback introduces stability and phase concerns.',
        ],
      },
      {
        id: '19.2', title: 'Single Pole Recursive Filters', page: 322, level: 'core',
        intuition: `A single-pole low-pass is the digital cousin of an RC circuit: each output leaks toward the input with a decay factor x. Set x close to one for slow smoothing.`,
        detail: `The single-pole low-pass is $y[n]=(1-x)x[n]+x\\,y[n-1]$, with $0<x<1$. The impulse response is $(1-x)x^n$, which decays to 36.8% after $d=-1/\\ln x$ samples. The −3 dB cutoff is approximately $f_c$ where $x=e^{-2\\pi f_c}$, so $x$ close to one gives a low cutoff. The high-pass version is $y[n]=\\frac{1+x}{2}x[n]-\\frac{1+x}{2}x[n-1]+x\\,y[n-1]$, which removes DC while passing high frequencies. The book compares these to RC filters and notes that the low-pass is good in the time domain but poor in the frequency domain: the roll-off is gentle and the stopband attenuation is limited. Stability requires $|x|<1$; if $x>1$, the output grows without bound.`,
        formulas: [
          { label: 'Low-pass coefficients', tex: 'a_0=1-x,\\qquad b_1=x', vars: '0 < x < 1' },
          { label: 'High-pass coefficients', tex: 'a_0=\\frac{1+x}{2},\\quad a_1=-\\frac{1+x}{2},\\quad b_1=x', vars: 'Remove DC' },
          { label: 'Decay and cutoff', tex: 'x=e^{-1/d}=e^{-2\\pi f_c}', vars: 'd = time constant in samples' },
        ],
        keyPoints: [
          'Low-pass: a₀=1−x, b₁=x; x controls smoothing.',
          'High-pass: a₀=(1+x)/2, a₁=−(1+x)/2, b₁=x.',
          'x=e^{−2πf_c}; x close to 1 → low cutoff and long time constant.',
          'Stability requires |x|<1.',
        ],
        caveat: `The single-pole filter is a poor frequency-domain filter. Cascading stages improves attenuation but also lengthens and complicates the response.`,
        application: `DC blocking, sensor smoothing, audio tone controls, and simple envelope detectors.`,
      },
      {
        id: '19.3', title: 'Narrow-band Filters', page: 326, level: 'advanced',
        intuition: `A narrow-band filter rings for a long time—it has to, because a narrow frequency band corresponds to a slowly decaying oscillation. Feedback makes this efficient but delicate.`,
        detail: `Narrow-band recursive filters place poles close to the unit circle at the desired center frequency. The closer the poles, the narrower the bandwidth and the longer the impulse response. This is the time–frequency tradeoff in recursive form: high selectivity requires a long memory, and a long memory means ringing and slow settling. Coefficient quantization can move poles outside the unit circle, causing instability, especially at low frequencies where the poles cluster near $z=1$. The book recommends cascading second-order sections (biquads) rather than using a single high-order recursion, because each section is easier to keep stable and to scale. Narrow-band recursive filters are useful for tone detection and notch filtering, but they are not a substitute for a sharp FIR design when linear phase matters.`,
        keyPoints: [
          'Narrow bandwidth ↔ poles near the unit circle ↔ long ringing.',
          'Coefficient quantization can destabilize high-order narrow-band filters.',
          'Cascade biquads for numerical robustness.',
        ],
        application: `Tone detection, notch filters for mains hum, and resonant audio filters.`,
      },
      {
        id: '19.4', title: 'Phase Response', page: 328, level: 'core',
        intuition: `Recursive filters usually delay different frequencies by different amounts. That disperses pulses and can distort time-domain information.`,
        detail: `A causal IIR filter generally has nonlinear phase. Its group delay varies with frequency, so a pulse’s components arrive at different times, spreading and ringing the waveform. Minimum-phase filters have the least phase lag for a given magnitude response, but they still distort phase. Linear phase requires a symmetric impulse response; a causal IIR cannot be exactly linear phase (unless it is trivial). FIR filters can be exactly linear phase at the cost of a longer kernel and more computation. The book uses this tradeoff to explain why windowed-sinc and other FIR designs are preferred for images and pulses, while IIR filters are preferred for audio and applications where magnitude response and efficiency dominate. All-pass filters can equalize phase without changing magnitude, but they add complexity and delay.`,
        keyPoints: [
          'IIR phase is generally nonlinear; group delay varies with frequency.',
          'Minimum phase minimizes delay but not phase distortion.',
          'Exact linear phase requires a symmetric FIR (or a noncausal design).',
          'All-pass filters can correct phase at the cost of extra stages.',
        ],
        application: `Audio equalizers often tolerate IIR phase; image and pulse systems usually require linear-phase FIR.`,
      },
      {
        id: '19.5', title: 'Using Integers', page: 332, level: 'advanced',
        intuition: `Feedback amplifies small errors. In fixed point, coefficient rounding and overflow can turn a stable design into an oscillating or silent one.`,
        detail: `Fixed-point recursive filters require careful scaling. The feedback coefficients must be represented with enough precision; otherwise the realized poles differ from the designed poles, shifting the cutoff or causing instability. Intermediate sums can overflow, so the signal should be scaled to leave headroom, or saturating arithmetic should be used. Round-off noise can circulate in the feedback loop, producing limit cycles—small persistent oscillations even with zero input. Techniques include error feedback, double-width accumulators, and cascaded biquads with per-section scaling. The book notes that integer arithmetic is fast and cheap, but the designer must prove that the quantized system remains stable and meets the specification.`,
        keyPoints: [
          'Coefficient quantization shifts poles and can destabilize the filter.',
          'Scale for headroom and use saturating arithmetic where appropriate.',
          'Limit cycles can persist with zero input due to feedback rounding.',
          'Biquad cascades with per-stage scaling are more robust than one high-order section.',
        ],
        caveat: `A filter that is stable in floating point can be unstable in fixed point. Always test the quantized implementation, not just the ideal design.`,
        application: `Embedded audio, motor control, and low-power sensors where fixed-point DSPs are common.`,
      },
    ],
    labs: [{
      id: 'recursive',
      title: 'Single-pole filters and stability',
      intro: 'Adjust the decay parameter x or cutoff frequency, then inspect the impulse response, step response, frequency response, and pole location. Push x past 1 to see instability.',
      tasks: [
        'Set fc=0.05 and measure the time constant from the impulse response. Compare with −1/ln x.',
        'Compare the low-pass and high-pass outputs on a signal with drift plus a high-frequency burst.',
        'Move the pole outside the unit circle. What happens to the output?',
      ],
    }, {
      id: 'resonator',
      title: 'Biquad resonator: poles, bandwidth, and ringing',
      intro: 'Place a complex-conjugate pole pair in the z-plane. See how radius controls bandwidth, Q, and ringing, and how crossing the unit circle causes instability.',
      tasks: [
        'Move the pole radius from 0.8 to 0.99. How do bandwidth and Q change?',
        'Change the resonant frequency. Does the peak move as predicted?',
        'Push the pole outside the unit circle. What happens to the impulse response?',
      ],
    }],
    worked: {
      title: 'Design a single-pole low-pass at 20 Hz',
      problem: 'A signal is sampled at 1 kHz. Design a single-pole low-pass with a 20 Hz cutoff. Find x, the coefficients, and the time constant in samples and milliseconds.',
      steps: [
        { title: 'Normalize the cutoff', text: '$f_c=20/1000=0.02$ cycles/sample.' },
        { title: 'Compute x', text: '$x=e^{-2\\pi f_c}=e^{-0.12566}\\approx0.8819$.' },
        { title: 'Find the coefficients', text: '$a_0=1-x=0.1181$, $b_1=x=0.8819$. The recursion is $y[n]=0.1181x[n]+0.8819y[n-1]$.' },
        { title: 'Compute the time constant', text: '$d=-1/\\ln x=-1/\\ln(0.8819)\\approx7.94$ samples, or 7.94 ms at 1 kHz.' },
      ],
      answer: 'x≈0.8819, a₀≈0.1181, b₁≈0.8819. The filter decays to 36.8% in about 8 samples (8 ms). Its roll-off is gentle—about 6 dB/octave—so it is a smoother, not a sharp anti-alias filter.',
    },
    misconceptions: [
      { wrong: 'Recursive filters are always more efficient and therefore always better.', right: 'They are efficient, but they have nonlinear phase, stability risks, and limited stopband performance. FIR filters are preferable when linear phase or robustness matters.' },
      { wrong: 'A single-pole filter has a sharp cutoff.', right: 'It rolls off at about 6 dB/octave and has poor stopband attenuation. It is a time-domain smoother.' },
      { wrong: 'The cutoff frequency formula x=e^{−2πfc} is exact for the −3 dB point.', right: 'It is an approximation that becomes less accurate at higher cutoffs. Measure the actual response when precision matters.' },
    ],
    takeaways: [
      'Recursive filters use feedback to create long impulse responses with few operations.',
      'Single-pole low-pass: a₀=1−x, b₁=x; high-pass uses spectral inversion-like coefficients.',
      'x=e^{−2πf_c} links decay, time constant, and cutoff; stability requires |x|<1.',
      'IIR phase is nonlinear, and narrow-band/high-order designs are sensitive to precision.',
      'Fixed-point implementation needs scaling, headroom, and limit-cycle checks.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'For a single-pole low-pass with x=0.9, the impulse response decays to 36.8% after about:',
        options: ['1 sample', '9.5 samples', '90 samples', '0.9 samples'],
        answer: 1,
        explanation: '$d=-1/\\ln(0.9)\\approx9.49$ samples. The decay factor per sample is 0.9.',
        wrongHints: { 0: 'One sample leaves 90%, not 36.8%.', 2: '90 samples would correspond to x≈0.989.', 3: '0.9 is the per-sample decay factor, not the time constant.' },
      },
      {
        type: 'mcq', question: 'What happens if the feedback coefficient of a single-pole filter exceeds 1?',
        options: ['The filter becomes linear phase', 'The output grows without bound (unstable)', 'The cutoff becomes zero', 'The filter becomes FIR'],
        answer: 1,
        explanation: 'The pole moves outside the unit circle, so the impulse response grows exponentially. Any nonzero input or initial condition drives the output to overflow.',
        wrongHints: { 0: 'Phase linearity is unrelated to stability.', 2: 'The cutoff may shift, but the dominant effect is instability.', 3: 'Feedback remains; the filter is still IIR.' },
      },
      {
        type: 'tf', question: 'A causal IIR filter can have exactly linear phase.',
        options: ['True', 'False'], answer: 1,
        explanation: 'Exact linear phase requires a symmetric impulse response. A causal IIR response is one-sided and infinite, so it cannot be exactly symmetric about a finite center (apart from trivial cases).',
      },
    ],
  },

  {
    number: 20,
    title: 'Chebyshev Filters',
    part: 'Digital Filters',
    tagline: 'Sharp frequency selectivity through deliberate passband ripple.',
    intro: `Chebyshev filters achieve a steeper transition than Butterworth filters by allowing ripple in the passband. They are recursive, fast, and more than adequate for many audio and communication applications—but their step response overshoots, and high-order designs can become unstable in finite precision.

This chapter explains the Chebyshev and Butterworth responses, the four design parameters, the step-response overshoot, and the stability limits imposed by round-off. It is the practical companion to the z-transform design methods in Chapter 33.`,
    objectives: [
      'Compare Chebyshev, Butterworth, and elliptic responses.',
      'Choose cutoff, ripple, order, and filter type.',
      'Explain the step-response overshoot and its cause.',
      'Recognize numerical stability limits and the biquad solution.',
    ],
    prerequisites: [14, 19],
    sections: [
      {
        id: '20.1', title: 'The Chebyshev and Butterworth Responses', page: 333, level: 'core',
        intuition: `Butterworth is maximally flat but rolls off gently. Chebyshev allows a controlled ripple in the passband and buys a much steeper roll-off with the same number of poles.`,
        detail: `The Chebyshev type-I response has equal ripple in the passband and a monotonic stopband. As the allowed ripple increases, the transition becomes sharper for a fixed order. With zero ripple, Chebyshev reduces to the maximally flat Butterworth response. The book uses percent ripple rather than dB; 0.5% ripple is a common choice because it is comparable to analog component tolerances and is barely visible on a linear plot. Type-II Chebyshev has ripple in the stopband; elliptic filters have ripple in both and give the sharpest transition for a given order, at the cost of design complexity. The chapter focuses on type I because it is the easiest to design and understand.`,
        formulas: [
          { label: 'Chebyshev magnitude (type I)', tex: '|H(j\\Omega)|^2=\\frac{1}{1+\\varepsilon^2 T_n^2(\\Omega/\\Omega_p)}', vars: 'T_n = Chebyshev polynomial; ε sets ripple' },
          { label: 'Ripple parameter', tex: '\\varepsilon=\\sqrt{10^{R_p/10}-1}', vars: 'R_p = passband ripple in dB' },
        ],
        keyPoints: [
          'Chebyshev trades passband ripple for sharper roll-off.',
          'Butterworth is the zero-ripple special case.',
          'Elliptic filters are sharper still but harder to design.',
        ],
        caveat: `“Chebyshev” without “type I” is ambiguous. Type II has stopband ripple and a different design procedure.`,
      },
      {
        id: '20.2', title: 'Designing the Filter', page: 334, level: 'core',
        intuition: `Choose low- or high-pass, cutoff, ripple, and number of poles. The z-transform supplies the coefficients; you do not need to derive them by hand.`,
        detail: `The book’s design procedure takes four parameters: response type (low-pass or high-pass), cutoff frequency $f_c$ (0 to 0.5), percent passband ripple, and number of poles (even, for the method presented). The cutoff is defined at the −3 dB point (amplitude 0.707), not at the ripple edge. The recursion coefficients can be obtained from tables or calculated by a design routine based on the z-transform. Higher order gives sharper roll-off but more overshoot and greater sensitivity to round-off. Near $f_c=0$ or 0.5, a given order rolls off more sharply than in the middle of the band, so fewer poles may be needed—but numerical precision becomes more critical. For robust implementation, factor the filter into cascaded second-order sections.`,
        formulas: [
          { label: 'Cutoff convention', tex: '|H(f_c)|=0.707\\;(-3\\ \\mathrm{dB})', vars: 'Book’s Chebyshev definition' },
          { label: 'Order vs. roll-off', tex: '\\approx 6n\\ \\mathrm{dB/octave}', vars: 'n poles, asymptotic' },
        ],
        keyPoints: [
          'Four parameters: type, cutoff, ripple, poles.',
          'Cutoff is the −3 dB point; poles are even in the book’s method.',
          'Higher order = sharper roll-off + more overshoot + more numerical sensitivity.',
        ],
        application: `Audio anti-alias filters, channel selection, and any application needing sharp magnitude selectivity with low computation.`,
      },
      {
        id: '20.3', title: 'Step Response Overshoot', page: 338, level: 'core',
        intuition: `A Chebyshev filter optimized for a steep frequency cutoff pays with a step response that overshoots and rings. The sharper the magnitude, the worse the transient.`,
        detail: `Chebyshev step responses overshoot by roughly 5% to 30%, increasing with order and depending slightly on cutoff frequency—a digital-specific effect with no exact analog counterpart. Butterworth filters also overshoot (about 4% for second order, growing with order), but less than Chebyshev of the same order. The overshoot is the time-domain manifestation of the passband ripple and sharp transition. For audio, where the ear is tolerant of phase and ringing, this may be acceptable. For pulses, images, or control signals, it can be unacceptable. The book contrasts this with Bessel filters, which have no overshoot and nearly linear phase but a much gentler roll-off.`,
        keyPoints: [
          'Chebyshev overshoot ≈5–30%, increasing with order.',
          'Overshoot and ringing are the price of sharp frequency selectivity.',
          'Bessel filters trade roll-off for clean transient response.',
        ],
        application: `Audio systems can often tolerate Chebyshev ringing; EKG and video systems usually cannot.`,
      },
      {
        id: '20.4', title: 'Stability', page: 339, level: 'advanced',
        intuition: `A recursive filter is stable only if all its poles are inside the unit circle. High order and low cutoff push poles close to the edge, where coefficient rounding can push them out.`,
        detail: `In exact arithmetic, a properly designed Chebyshev filter is stable. In finite precision, the recursion coefficients are rounded, so the realized poles differ from the designed poles. For high-order filters—especially at low cutoff frequencies—the poles cluster near $z=1$, and tiny coefficient errors can move them outside the unit circle. The input coefficients may also become extremely small while the feedback coefficients are large, so round-off noise dominates. The book gives approximate maximum pole counts for single precision (e.g., 6 poles at $f_c=0.05$, 20 poles at 0.25). Solutions include double precision, cascading second-order sections, and scaling each section. If the filter is pushed too far, the output oscillates and eventually overflows. Stability must be verified with the quantized coefficients, not just the ideal design.`,
        formulas: [
          { label: 'Stability condition', tex: '|p_i|<1\\quad\\text{for all poles }p_i', vars: 'Poles inside the unit circle' },
        ],
        keyPoints: [
          'Finite-precision coefficients shift poles; high-order/low-cutoff designs are most vulnerable.',
          'Cascade biquads and use double precision to extend the stable range.',
          'Test the quantized implementation, not just the ideal coefficients.',
        ],
        caveat: `A pole exactly on the unit circle is marginally stable and will oscillate forever; any perturbation can make it unstable.`,
      },
    ],
    labs: [{
      id: 'chebyshev',
      title: 'Ripple, order, and overshoot',
      intro: 'Design low-pass and high-pass Chebyshev filters with adjustable order, ripple, and cutoff. Compare the magnitude response with Butterworth, inspect the pole locations, and measure step overshoot.',
      tasks: [
        'Set 0% ripple. Confirm that the response becomes Butterworth.',
        'Increase the order at a fixed ripple. How does the transition sharpen, and what happens to overshoot?',
        'Push the order high at a low cutoff. Do the poles stay inside the unit circle?',
      ],
    }],
    worked: {
      title: 'Estimate the order for a specification',
      problem: 'A low-pass filter must pass 1 kHz with less than 3 dB attenuation and reject 2 kHz by at least 40 dB. Estimate the required Chebyshev order for 1 dB ripple. (Use the asymptotic 6n dB/octave rule as a first estimate.)',
      steps: [
        { title: 'Compute the frequency ratio', text: 'The transition is from 1 to 2 kHz, one octave.' },
        { title: 'Estimate the required slope', text: 'To go from −1 dB at 1 kHz to −40 dB at 2 kHz requires about 39 dB of additional attenuation in one octave, i.e., ≈39 dB/octave.' },
        { title: 'Convert to order', text: 'At about 6 dB/octave per pole, $n\\approx39/6=6.5$, so choose 8 poles (the method uses even orders).' },
        { title: 'Check with the exact response', text: 'The asymptotic estimate ignores the transition curvature and ripple. Use the actual Chebyshev response to verify the 2 kHz attenuation and adjust the order if needed.' },
      ],
      answer: 'About 8 poles for a first estimate. Chebyshev roll-off is steeper than Butterworth near the cutoff, so 6 poles might suffice; always verify with the exact response.',
    },
    misconceptions: [
      { wrong: 'Chebyshev filters are always better than Butterworth because they roll off faster.', right: 'They trade passband ripple and transient overshoot for steepness. Butterworth is preferable when flatness and clean step response matter.' },
      { wrong: 'A higher-order filter is always more stable because it is closer to ideal.', right: 'Higher order concentrates poles near the unit circle and increases sensitivity to coefficient rounding, especially at low cutoff frequencies.' },
      { wrong: 'The cutoff is the edge of the ripple band.', right: 'In the book’s design, the cutoff is the −3 dB point (0.707 amplitude), which is not the same as the ripple edge.' },
    ],
    takeaways: [
      'Chebyshev type I allows passband ripple to achieve a steeper roll-off.',
      'Butterworth is the zero-ripple case; elliptic is sharper but more complex.',
      'Design with type, cutoff, ripple, and order; cutoff is −3 dB in the book’s convention.',
      'Step-response overshoot (5–30%) is the time-domain price of frequency selectivity.',
      'High-order/low-cutoff designs need double precision or cascaded biquads for stability.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'Increasing Chebyshev passband ripple generally:',
        options: ['slows the roll-off and reduces overshoot', 'sharpens the roll-off and increases overshoot', 'makes the filter FIR', 'removes the need for a cutoff frequency'],
        answer: 1,
        explanation: 'More ripple allows a steeper transition for the same order, but the sharper response rings more in the time domain.',
        wrongHints: { 0: 'The tradeoff goes the other way: more ripple buys sharper roll-off.', 2: 'Chebyshev filters are recursive IIR designs.', 3: 'A cutoff frequency is always required to place the passband edge.' },
      },
      {
        type: 'mcq', question: 'Why can a high-order Chebyshev filter become unstable in single precision?',
        options: ['Because Chebyshev filters are inherently unstable', 'Because coefficient rounding can move poles outside the unit circle', 'Because the FFT length is too short', 'Because the input signal is too large'],
        answer: 1,
        explanation: 'High-order/low-cutoff designs have poles clustered near z=1. Rounding the coefficients can push a pole outside |z|=1, causing growth.',
        wrongHints: { 0: 'Ideal Chebyshev filters are stable; finite precision is the issue.', 2: 'This is a recursive IIR filter; no FFT is involved.', 3: 'Large inputs can cause overflow, but the stability issue is pole placement.' },
      },
      {
        type: 'tf', question: 'A Butterworth filter is a Chebyshev filter with zero passband ripple.',
        options: ['True', 'False'], answer: 0,
        explanation: 'The Butterworth response is the maximally flat special case of the Chebyshev type-I family when the ripple is set to zero.',
      },
    ],
  },

  {
    number: 21,
    title: 'Filter Comparison',
    part: 'Digital Filters',
    tagline: 'There is no best filter—only the best fit for a specification.',
    intro: `By now you have met moving averages, windowed-sinc FIR filters, single-pole recursive filters, and Chebyshev IIR filters. Each excels in a different corner of the design space. This chapter compares them directly: analog versus digital, windowed-sinc versus Chebyshev, and moving average versus single pole.

The goal is not to crown a winner but to teach the questions that lead to the right choice: What is encoded in the signal? How sharp must the transition be? Is linear phase required? How much computation and latency are available?`,
    objectives: [
      'Compare analog and digital filters on precision, flexibility, and cost.',
      'Choose between windowed-sinc and Chebyshev for a given specification.',
      'Choose between moving average and single-pole filters.',
      'Justify a filter choice using time/frequency requirements.',
    ],
    prerequisites: [14, 15, 16, 19, 20],
    sections: [
      {
        id: '21.1', title: 'Match #1: Analog vs. Digital Filters', page: 343, level: 'core',
        intuition: `Analog filters are continuous, fast, and free of quantization—but they drift, age, and are hard to reconfigure. Digital filters are precise, repeatable, and flexible—but need converters, clocks, and computation.`,
        detail: `Analog filters operate directly on the signal and can have very wide bandwidth and low latency. Their components have tolerances (often 1–5%), drift with temperature and age, and are difficult to change after manufacture. Digital filters have coefficient precision limited only by the number representation (often 0.0001% or better), are exactly repeatable, and can be reconfigured in software. They require an ADC/DAC, anti-alias/reconstruction filters, and enough processing speed. The book notes that digital filters can outperform analog filters by orders of magnitude in precision, but the analog interface remains essential. In many systems, the best design is a hybrid: analog anti-alias filtering followed by digital signal processing.`,
        keyPoints: [
          'Analog: continuous, low latency, no quantization, but drift and component tolerance.',
          'Digital: precise, repeatable, flexible, but needs conversion and computation.',
          'Hybrid systems use analog anti-alias/reconstruction plus digital processing.',
        ],
        application: `A digital hearing aid uses an analog microphone/ADC front end, digital filtering and compression, and a DAC/amplifier output.`,
      },
      {
        id: '21.2', title: 'Match #2: Windowed-Sinc vs. Chebyshev', page: 346, level: 'core',
        intuition: `Windowed-sinc gives near-ideal magnitude and exact linear phase, but it is slow. Chebyshev gives a sharp magnitude response with far fewer operations, but it rings and distorts phase.`,
        detail: `A windowed-sinc FIR filter can achieve very deep stopband attenuation (−74 dB with Blackman, more by cascading) and exactly linear phase. Its cost is proportional to the kernel length, which grows as the transition narrows. A Chebyshev IIR filter achieves a comparable or sharper transition with far fewer coefficients and much less computation, but its phase is nonlinear and its step response overshoots. For images, pulses, and any application where waveform shape matters, the linear-phase FIR is usually worth the cost. For audio, telecommunications, and embedded systems where magnitude response and efficiency dominate, Chebyshev or another IIR design is often preferred. The comparison is a template for all FIR-vs-IIR decisions.`,
        keyPoints: [
          'Windowed-sinc: linear phase, deep stopband, expensive for narrow transitions.',
          'Chebyshev: sharp magnitude, efficient, nonlinear phase and overshoot.',
          'Choose by whether time-domain shape or computational cost dominates.',
        ],
        application: `Linear-phase FIR for image resampling and pulse shaping; Chebyshev IIR for audio equalization and channel filters.`,
      },
      {
        id: '21.3', title: 'Match #3: Moving Average vs. Single Pole', page: 348, level: 'core',
        intuition: `Both are simple smoothers. The moving average is optimal for white noise and has linear phase; the single pole is cheaper and has a smoother exponential response but poorer frequency selectivity.`,
        detail: `The moving average uses a finite rectangular kernel, has exactly linear phase (if symmetric), and is optimal for reducing white noise at a fixed 0–100% rise time. Its frequency response is sinc-like with poor stopband attenuation. The single-pole recursive filter uses one multiply and one add per sample, has an exponential impulse response, and a first-order roll-off. It is even cheaper than the recursive moving average and is useful for DC blocking, envelope smoothing, and simple tone controls. Its phase is nonlinear, and its stopband attenuation is limited. The book’s comparison reinforces the recurring theme: time-domain performance and frequency-domain performance trade against each other, and the simplest filter is often the right one when the specification is modest.`,
        keyPoints: [
          'Moving average: linear phase, optimal white-noise smoothing, poor stopband.',
          'Single pole: cheapest, exponential response, nonlinear phase, gentle roll-off.',
          'Both are time-domain smoothers, not sharp frequency selectors.',
        ],
        application: `Moving average for sensor averaging and decimation pre-filtering; single pole for DC blocking and control-loop smoothing.`,
      },
    ],
    labs: [{
      id: 'filter-compare',
      title: 'Four filters, one specification',
      intro: 'Apply a moving average, single-pole, windowed-sinc, and Chebyshev filter to the same noisy signal. Compare magnitude, phase, step response, and cost.',
      tasks: [
        'Match the four filters to approximately the same −3 dB cutoff. Which has the sharpest transition?',
        'Which filters preserve the step edge best? Which ring the most?',
        'Estimate the operations per sample for each. Which would you choose for a battery-powered sensor?',
      ],
    }],
    worked: {
      title: 'Choose a filter for three scenarios',
      problem: 'Recommend a filter family for (a) removing 50 Hz hum from an EKG while preserving QRS shape, (b) anti-aliasing a 48 kHz audio ADC with a 20 kHz passband, and (c) smoothing a noisy temperature sensor on a microcontroller with a 1 Hz update rate.',
      steps: [
        { title: 'Scenario (a): EKG + hum', text: 'Time-domain information → linear phase and minimal overshoot. Use a linear-phase FIR notch/band-stop at 50 Hz, or a Bessel low-pass plus a narrow notch. Avoid a sharp Chebyshev low-pass that would ring the QRS.' },
        { title: 'Scenario (b): audio anti-alias', text: 'Frequency-domain information with a tight transition (20–24 kHz). Use a high-order linear-phase FIR (windowed-sinc/FFT) or an oversampled sigma-delta converter with digital decimation. Chebyshev analog anti-alias may precede the ADC.' },
        { title: 'Scenario (c): temperature smoothing', text: 'Slow, low-cost, no phase-shape requirement. Use a single-pole IIR or a recursive moving average. A 1 Hz update rate leaves plenty of computation, but simplicity and stability favor the single pole or short moving average.' },
      ],
      answer: '(a) linear-phase FIR notch/Bessel combination; (b) high-order linear-phase FIR or sigma-delta with digital decimation; (c) single-pole or short recursive moving average. Each choice follows the information encoding, phase requirement, and cost constraint.',
    },
    misconceptions: [
      { wrong: 'Digital filters are always better than analog filters.', right: 'Digital filters offer precision and flexibility but require converters, clocks, and computation. Analog filters are essential at the interface and for low-latency/wideband applications.' },
      { wrong: 'The filter with the sharpest cutoff is the best choice.', right: 'Sharp cutoff often brings ringing, phase distortion, and numerical sensitivity. The best filter matches the information and the constraints.' },
      { wrong: 'A moving average and a single-pole filter are interchangeable.', right: 'They have different impulse shapes, phase behavior, and frequency responses. The moving average is linear phase and optimal for white noise; the single pole is cheaper and smoother in the time domain.' },
    ],
    takeaways: [
      'Filter choice is a multi-objective tradeoff: magnitude, phase, transient, cost, latency, precision.',
      'Windowed-sinc/FIR for linear phase and deep stopbands; Chebyshev/IIR for efficiency and sharp magnitude.',
      'Moving average for optimal white-noise smoothing; single pole for cheap exponential smoothing.',
      'Analog and digital filters complement each other; the interface still matters.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'Which filter is the best choice when exact linear phase is required?',
        options: ['A single-pole IIR filter', 'A symmetric FIR filter', 'A Chebyshev IIR filter', 'An analog RC filter'],
        answer: 1,
        explanation: 'A symmetric FIR impulse response gives exactly linear phase (constant group delay). Causal IIR filters generally have nonlinear phase.',
        wrongHints: { 0: 'A single pole has nonlinear phase.', 2: 'Chebyshev IIR filters have nonlinear phase and overshoot.', 3: 'An RC filter has a frequency-dependent phase shift, not linear phase.' },
      },
      {
        type: 'mcq', question: 'For reducing white noise while keeping the sharpest 0–100% step response, the optimal linear filter is:',
        options: ['a single-pole low-pass', 'a moving average', 'a Chebyshev low-pass', 'a differentiator'],
        answer: 1,
        explanation: 'With equal noise on every sample and a fixed 0–100% rise time, equal weighting (the moving average) minimizes output noise.',
        wrongHints: { 0: 'A single pole has an exponential kernel, which is not optimal for this criterion.', 2: 'Chebyshev rings and is optimized for frequency selectivity, not this time-domain criterion.', 3: 'A differentiator enhances high frequencies and noise.' },
      },
      {
        type: 'tf', question: 'A windowed-sinc filter with a very narrow transition band is computationally cheaper than a Chebyshev filter with the same transition.',
        options: ['True', 'False'], answer: 1,
        explanation: 'The windowed-sinc kernel length grows as 1/BW, making narrow transitions expensive. A Chebyshev IIR achieves a similar transition with far fewer operations, though with nonlinear phase.',
      },
    ],
  },
];
