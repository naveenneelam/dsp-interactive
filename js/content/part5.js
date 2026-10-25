/**
 * Part V — Complex Techniques (chapters 30–33)
 */

export const part5 = [
  {
    number: 30,
    title: 'Complex Numbers',
    part: 'Complex Techniques',
    tagline: 'The algebra that makes phase, frequency response, and stability visual.',
    intro: `Complex numbers are not an esoteric detour; they are the natural language of sinusoids, filters, and stability. A complex number packages an amplitude and a phase into one object, and multiplication then rotates and scales. That is exactly what a linear system does to a sinusoid.

This chapter builds the complex number system from the definition of $j$, develops polar notation, shows how substitution simplifies circuit analysis, and connects complex exponentials to real sinusoids and system responses. It is the foundation for the complex DFT, Laplace transform, and z-transform.`,
    objectives: [
      'Perform arithmetic with complex numbers in rectangular and polar form.',
      'Convert between rectangular and polar representations.',
      'Represent sinusoids as complex exponentials and phasors.',
      'Use complex impedance and transfer functions.',
      'Explain why negative frequencies appear in complex notation.',
    ],
    prerequisites: [5, 8],
    sections: [
      {
        id: '30.1', title: 'The Complex Number System', page: 551, level: 'core',
        intuition: `A complex number has a real and an imaginary part: $a+jb$. Think of it as a point in a plane, with $a$ horizontal and $b$ vertical.`,
        detail: `The imaginary unit is defined by $j^2=-1$ (engineers use $j$ because $i$ is current). A complex number $z=a+jb$ has real part $a$ and imaginary part $b$. Addition is componentwise; multiplication uses $j^2=-1$: $(a+jb)(c+jd)=(ac-bd)+j(ad+bc)$. The complex conjugate $z^*=a-jb$ reflects across the real axis. The magnitude is $|z|=\\sqrt{a^2+b^2}$, and $zz^*=|z|^2$. Complex numbers form a field: addition and multiplication are commutative, associative, and distributive. They can be added like vectors but multiplied like rotations and scalings.`,
        formulas: [
          { label: 'Imaginary unit', tex: 'j^2=-1', vars: 'Engineers use j; mathematicians use i' },
          { label: 'Multiplication', tex: '(a+jb)(c+jd)=(ac-bd)+j(ad+bc)', vars: 'Use j²=−1' },
          { label: 'Magnitude', tex: '|z|=\\sqrt{a^2+b^2}', vars: 'Distance from the origin' },
        ],
        keyPoints: [
          'Complex numbers are points/vectors in a 2-D plane with a special multiplication.',
          'The conjugate reflects across the real axis.',
          'Multiplication combines scaling and rotation.',
        ],
      },
      {
        id: '30.2', title: 'Polar Notation', page: 555, level: 'core',
        intuition: `Instead of coordinates, describe a complex number by its distance from the origin and its angle. Multiplication then multiplies distances and adds angles.`,
        detail: `Polar form is $z=r e^{j\\theta}=r(\\cos\\theta+j\\sin\\theta)$, where $r=|z|$ and $\\theta=\\arg z$. Conversion uses $r=\\sqrt{a^2+b^2}$ and $\\theta=\\atan2(b,a)$; back, $a=r\\cos\\theta$, $b=r\\sin\\theta$. Multiplication multiplies magnitudes and adds angles; division divides magnitudes and subtracts angles. Powers use $z^n=r^n e^{jn\\theta}$ (De Moivre), and roots divide the angle by n and add multiples of $2\\pi/n$. Euler’s formula $e^{j\\theta}=\\cos\\theta+j\\sin\\theta$ is the bridge between exponentials and sinusoids. The angle is defined modulo $2\\pi$, which is the source of phase wrapping.`,
        formulas: [
          { label: 'Euler’s formula', tex: 'e^{j\\theta}=\\cos\\theta+j\\sin\\theta', vars: 'Unit circle in the complex plane' },
          { label: 'Polar form', tex: 'z=re^{j\\theta}', vars: 'r = magnitude, θ = phase' },
          { label: 'Multiplication', tex: 'r_1e^{j\\theta_1}\\cdot r_2e^{j\\theta_2}=r_1r_2e^{j(\\theta_1+\\theta_2)}', vars: 'Multiply magnitudes, add angles' },
        ],
        keyPoints: [
          'Polar form simplifies multiplication, division, powers, and roots.',
          'Use atan2 to choose the correct quadrant.',
          'Phase is defined modulo 2π.',
        ],
        application: `AC circuit analysis, filter frequency response, and phasor diagrams.`,
      },
      {
        id: '30.3', title: 'Using Complex Numbers by Substitution', page: 557, level: 'core',
        intuition: `Complex algebra lets you solve AC circuits as if they were DC circuits: replace resistances with complex impedances and solve the same equations.`,
        detail: `In sinusoidal steady state, voltages and currents are represented by phasors, and components by complex impedances: $Z_R=R$, $Z_L=j\\omega L$, $Z_C=1/(j\\omega C)$. Kirchhoff’s laws and series/parallel formulas apply exactly as in DC, but with complex arithmetic. The resulting phasor gives amplitude and phase; the time-domain signal is the real part of the phasor times $e^{j\\omega t}$. The book calls this “using complex numbers by substitution”: substitute complex impedances, solve algebraically, then interpret the result. This avoids solving differential equations directly and makes phase relationships explicit.`,
        formulas: [
          { label: 'Impedances', tex: 'Z_R=R,\\quad Z_L=j\\omega L,\\quad Z_C=\\frac{1}{j\\omega C}', vars: 'Sinusoidal steady state' },
          { label: 'Voltage divider', tex: 'V_{\\mathrm{out}}=V_{\\mathrm{in}}\\frac{Z_2}{Z_1+Z_2}', vars: 'Complex arithmetic' },
        ],
        keyPoints: [
          'Replace R, L, C with complex impedances.',
          'Solve with the same series/parallel rules as DC.',
          'The complex result encodes amplitude and phase.',
        ],
        application: `RC/RL/RLC filter analysis, impedance matching, and AC power.`,
      },
      {
        id: '30.4', title: 'Complex Representation of Sinusoids', page: 559, level: 'core',
        intuition: `A cosine is the real part of a rotating complex exponential. Positive and negative frequencies are the two directions of rotation.`,
        detail: `Euler’s formula gives $\\cos\\theta=\\frac12(e^{j\\theta}+e^{-j\\theta})$ and $\\sin\\theta=\\frac{1}{2j}(e^{j\\theta}-e^{-j\\theta})$. A real sinusoid therefore contains both a positive-frequency and a negative-frequency component. In complex notation, a phasor $Ae^{j\\phi}$ represents a sinusoid of amplitude A and phase φ; multiplying by $e^{j\\omega t}$ rotates it. The real part is the physical signal. Negative frequencies are a mathematical convenience, not a separate physical oscillation: for a real signal, the negative-frequency component is the conjugate of the positive one. Complex representation makes amplitude and phase manipulations algebraic, and it is essential for modulation, analytic signals, and the complex DFT.`,
        formulas: [
          { label: 'Euler expansions', tex: '\\cos\\theta=\\frac{e^{j\\theta}+e^{-j\\theta}}{2},\\qquad \\sin\\theta=\\frac{e^{j\\theta}-e^{-j\\theta}}{2j}', vars: 'Real sinusoids as conjugate pairs' },
          { label: 'Phasor', tex: 'x(t)=\\mathrm{Re}\\{Ae^{j\\phi}e^{j\\omega t}\\}=A\\cos(\\omega t+\\phi)', vars: 'A = amplitude, φ = phase' },
        ],
        keyPoints: [
          'A real cosine has positive- and negative-frequency components.',
          'Phasors encode amplitude and phase.',
          'Negative frequencies are conjugates, not independent physical tones.',
        ],
        caveat: `When you take the real part, you must keep track of both conjugate components. Dropping the negative-frequency term changes the amplitude by a factor of two.`,
      },
      {
        id: '30.5', title: 'Complex Representation of Systems', page: 561, level: 'core',
        intuition: `A linear system’s response to a complex exponential is the same exponential multiplied by a complex number. That number is the frequency response.`,
        detail: `For a linear time-invariant system, an input $e^{j\\omega n}$ produces $H(e^{j\\omega})e^{j\\omega n}$, where $H$ is complex. The magnitude of $H$ scales the amplitude; the angle shifts the phase. This is why the frequency response is complex-valued: it contains both gain and phase. For a real impulse response, $H(e^{-j\\omega})=H^*(e^{j\\omega})$, so the response to a real sinusoid is real. The transfer function $H(z)$ or $H(s)$ extends this idea to the z- and s-domains, where poles and zeros describe stability and resonance. Complex notation turns convolution and differential equations into algebraic multiplication.`,
        formulas: [
          { label: 'Complex exponential response', tex: 'e^{j\\omega n}\\;\\longrightarrow\\;H(e^{j\\omega})e^{j\\omega n}', vars: 'H = complex frequency response' },
          { label: 'Real-symmetry condition', tex: 'H(e^{-j\\omega})=H^*(e^{j\\omega})', vars: 'For a real impulse response' },
        ],
        keyPoints: [
          'Complex exponentials are eigenfunctions of LTI systems.',
          'H(ω) contains gain and phase.',
          'Real impulse responses imply conjugate-symmetric frequency responses.',
        ],
      },
      {
        id: '30.6', title: 'Electrical Circuit Analysis', page: 563, level: 'support',
        intuition: `Complex impedance turns Ohm’s law and Kirchhoff’s laws into algebra. A capacitor’s impedance falls with frequency; an inductor’s rises.`,
        detail: `For a resistor, voltage and current are in phase. For a capacitor, current leads voltage by 90°; for an inductor, current lags by 90°. Complex impedance captures this: $Z_C=1/(j\\omega C)=-j/(\\omega C)$, $Z_L=j\\omega L$. Series impedances add; parallel impedances combine reciprocally. A voltage divider gives the transfer function directly. Resonant circuits occur when inductive and capacitive reactances cancel, producing a peak or notch. The book uses these examples to show that complex arithmetic is not abstract—it is the natural bookkeeping for phase. The same transfer-function ideas reappear in the s-domain (Chapter 32) and z-domain (Chapter 33).`,
        formulas: [
          { label: 'RC low-pass transfer function', tex: 'H(j\\omega)=\\frac{1}{1+j\\omega RC}', vars: 'Cutoff at ω=1/RC' },
          { label: 'Series RLC impedance', tex: 'Z=R+j\\left(\\omega L-\\frac{1}{\\omega C}\\right)', vars: 'Resonance when ωL=1/(ωC)' },
        ],
        keyPoints: [
          'Capacitor: current leads voltage; inductor: current lags.',
          'Impedances combine like resistors, but with complex arithmetic.',
          'Resonance occurs when reactances cancel.',
        ],
        application: `Analog filter design, impedance matching, and power-factor correction.`,
      },
    ],
    labs: [{
      id: 'complex',
      title: 'Rotate, multiply, and filter',
      intro: 'Explore the complex plane: add, multiply, conjugate, and convert between rectangular and polar forms. Then watch a phasor rotate and see how a complex gain changes a sinusoid’s amplitude and phase.',
      tasks: [
        'Multiply two complex numbers in polar form. Verify that magnitudes multiply and angles add.',
        'Move a point to each quadrant and check the atan2 angle.',
        'Apply a complex gain to a sinusoid. How do magnitude and phase change the waveform?',
      ],
    }],
    worked: {
      title: 'Multiply in polar form',
      problem: 'Multiply $z_1=3+j4$ and $z_2=-1+j$. Give the result in rectangular and polar form.',
      steps: [
        { title: 'Convert to polar', text: '$z_1$: $r_1=5$, $\\theta_1=\\atan2(4,3)=53.13°$. $z_2$: $r_2=\\sqrt2≈1.414$, $\\theta_2=135°$.' },
        { title: 'Multiply magnitudes', text: '$r=r_1r_2=5\\sqrt2≈7.071$.' },
        { title: 'Add angles', text: '$\\theta=53.13°+135°=188.13°$.' },
        { title: 'Convert back', text: '$a=7.071\\cos188.13°≈-7$, $b=7.071\\sin188.13°≈-1$. So $z=-7-j$.' },
        { title: 'Check in rectangular form', text: '$(3+j4)(-1+j)=-3+3j-4j+4j^2=-7-j$. The results agree.' },
      ],
      answer: '$z=-7-j$, with magnitude $5\\sqrt2≈7.07$ and angle $188.13°$ (or −171.87°).',
    },
    misconceptions: [
      { wrong: 'Imaginary numbers are not real, so they cannot represent physical signals.', right: 'Complex numbers are a bookkeeping tool. The physical signal is the real part; the imaginary part tracks phase and the negative-frequency component.' },
      { wrong: 'Negative frequencies are unphysical and can be ignored.', right: 'They are mathematical components needed for real signals and for correct amplitude scaling. Ignoring them can halve or distort the result.' },
      { wrong: 'Complex multiplication is just componentwise multiplication.', right: 'You must use $j^2=-1$: $(a+jb)(c+jd)=(ac-bd)+j(ad+bc)$.' },
    ],
    takeaways: [
      'Complex numbers represent amplitude and phase as a single object.',
      'Polar form makes multiplication, division, powers, and roots intuitive.',
      'Complex exponentials are eigenfunctions of LTI systems; H(ω) is complex gain.',
      'Negative frequencies are conjugates required by real signals.',
      'Complex impedance turns AC circuit analysis into algebra.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'What is $(1+j)(1-j)$?',
        options: ['0', '2', '2j', '1'],
        answer: 1,
        explanation: '$(1+j)(1-j)=1-j+j-j^2=1-(-1)=2$. This is also $|1+j|^2$.',
        wrongHints: { 0: 'The cross terms cancel, but the real terms add.', 2: 'The imaginary cross terms cancel, leaving a real result.', 3: 'The product of conjugates is the squared magnitude, which is 2.' },
      },
      {
        type: 'mcq', question: 'A sinusoid $A\\cos(\\omega t+\\phi)$ can be written as:',
        options: ['$A e^{j(\\omega t+\\phi)}$', '$\\mathrm{Re}\\{A e^{j(\\omega t+\\phi)}\\}$', '$A e^{-\\omega t}$', '$A\\sin(\\omega t)$'],
        answer: 1,
        explanation: 'Euler’s formula gives $A e^{j(\\omega t+\\phi)}=A\\cos(\\omega t+\\phi)+jA\\sin(\\omega t+\\phi)$; the real part is the cosine.',
        wrongHints: { 0: 'That is a complex exponential, not the real sinusoid.', 2: 'That is a decaying real exponential.', 3: 'Sine is a different phase (90° shift).' },
      },
      {
        type: 'tf', question: 'The frequency response of a real-valued LTI system satisfies H(−ω)=H*(ω).',
        options: ['True', 'False'], answer: 0,
        explanation: 'A real impulse response gives conjugate-symmetric frequency response, which is why negative frequencies are redundant for real systems.',
      },
    ],
  },

  {
    number: 31,
    title: 'The Complex Fourier Transform',
    part: 'Complex Techniques',
    tagline: 'One transform to rule them all—including phase and negative frequencies.',
    intro: `The real DFT is intuitive and adequate for real signals. The complex DFT is more compact, more general, and mathematically cleaner. It represents both positive and negative frequencies, handles complex signals, and turns convolution and modulation into simple algebra.

This chapter shows that the real and complex DFTs are equivalent for real signals, develops the complex DFT equations, places it in the family of Fourier transforms, and explains why the complex form is the tool of choice in advanced DSP.`,
    objectives: [
      'Write the complex DFT and inverse DFT.',
      'Show the equivalence between real and complex DFTs for real signals.',
      'Interpret negative frequencies and conjugate symmetry.',
      'Place the complex DFT in the four-transform family.',
      'Explain the advantages of complex notation.',
    ],
    prerequisites: [8, 30],
    sections: [
      {
        id: '31.1', title: 'The Real DFT', page: 567, level: 'core',
        intuition: `The real DFT stores cosine and sine amplitudes for N/2+1 bins. It is easy to interpret but awkward for negative frequencies and complex signals.`,
        detail: `The real DFT analysis equations use $2/N$ scaling for interior bins and $1/N$ for DC/Nyquist, with a negative sign on the imaginary (sine) part. Synthesis adds the cosine and sine components with matching scaling. The real DFT is sufficient for real-valued signals, but it hides the symmetry between positive and negative frequencies and cannot represent a complex signal. It is also less convenient for convolution and modulation identities, which are cleaner in complex form. The book reviews the real DFT to set up the equivalence with the complex form.`,
        formulas: [
          { label: 'Real DFT (analysis)', tex: '\\mathrm{Re}X[k]=\\frac{2}{N}\\sum x[n]\\cos\\frac{2\\pi kn}{N},\\qquad \\mathrm{Im}X[k]=-\\frac{2}{N}\\sum x[n]\\sin\\frac{2\\pi kn}{N}', vars: 'Interior bins' },
        ],
        keyPoints: [
          'Real DFT: N/2+1 bins, cosine/sine amplitudes.',
          'Scaling differs at DC/Nyquist.',
          'It is a one-sided view of a conjugate-symmetric spectrum.',
        ],
      },
      {
        id: '31.2', title: 'Mathematical Equivalence', page: 569, level: 'core',
        intuition: `For a real signal, the complex DFT contains the same information as the real DFT—just stored as N complex bins with conjugate symmetry.`,
        detail: `Using Euler’s formula, the complex DFT’s real and imaginary parts can be rearranged into the real DFT’s cosine and sine coefficients. The complex DFT has N bins; for a real signal, bins $k$ and $N-k$ are conjugates, so only N/2+1 are independent. The real DFT’s $2/N$ scaling comes from combining the positive- and negative-frequency components; DC and Nyquist are counted once. Thus the two transforms are mathematically equivalent for real signals, but the complex form retains the negative frequencies and is easier to manipulate. The equivalence is exact, not an approximation.`,
        formulas: [
          { label: 'Complex DFT', tex: 'X[k]=\\sum_{n=0}^{N-1}x[n]e^{-j2\\pi kn/N}', vars: 'N complex bins' },
          { label: 'Conjugate symmetry', tex: 'X[N-k]=X^*[k]\\quad\\text{(real }x[n]\\text{)}', vars: 'N/2+1 independent bins' },
        ],
        keyPoints: [
          'The complex DFT and real DFT contain the same information for real signals.',
          'Negative-frequency bins are conjugates, not new information.',
          'The complex form is more compact and algebraically convenient.',
        ],
      },
      {
        id: '31.3', title: 'The Complex DFT', page: 570, level: 'core',
        intuition: `The complex DFT projects the signal onto complex exponentials. Each bin has a magnitude and phase, and both positive and negative frequencies are explicit.`,
        detail: `The forward transform is $X[k]=\\sum_{n=0}^{N-1}x[n]e^{-j2\\pi kn/N}$; the inverse is $x[n]=\\frac{1}{N}\\sum_{k=0}^{N-1}X[k]e^{j2\\pi kn/N}$. Inputs and outputs may be complex. For a real input, $X[N-k]=X^*[k]$. The magnitude $|X[k]|$ is the amplitude of the complex exponential at bin $k$; the phase is its angle. Negative frequencies correspond to $k>N/2$ (or negative $k$ in the centered display). The complex DFT is periodic in both domains and is the basis of the FFT. Its algebra makes convolution, modulation, and filtering identities simple.`,
        formulas: [
          { label: 'Complex DFT pair', tex: 'X[k]=\\sum_{n=0}^{N-1}x[n]e^{-j2\\pi kn/N},\\qquad x[n]=\\frac{1}{N}\\sum_{k=0}^{N-1}X[k]e^{j2\\pi kn/N}', vars: 'Forward/inverse pair' },
          { label: 'Magnitude and phase', tex: '|X[k]|,\\qquad \\angle X[k]', vars: 'Amplitude and phase of bin k' },
        ],
        keyPoints: [
          'Complex DFT has N bins, including negative frequencies.',
          'The inverse includes a 1/N scale.',
          'Real inputs produce conjugate-symmetric spectra.',
        ],
        caveat: `Different software uses different sign conventions and scaling. Check whether the forward transform uses e^{−jωn} and whether the inverse divides by N.`,
      },
      {
        id: '31.4', title: 'The Family of Fourier Transforms', page: 575, level: 'core',
        intuition: `The complex DFT is one member of a four-member family. Continuous/discrete and periodic/aperiodic determine which transform applies.`,
        detail: `The continuous Fourier transform handles aperiodic continuous signals; the Fourier series handles periodic continuous signals; the DTFT handles aperiodic discrete signals; the DFT handles periodic/finite discrete signals. Each has a complex form, and each can be derived as a limiting case of another. The complex DFT is the computational workhorse because it operates on finite arrays and has a fast algorithm. The family tree clarifies why sampling produces periodic spectra, why windowing causes leakage, and why the DFT’s frequency axis is periodic. The book presents the relationships as a unified framework rather than isolated formulas.`,
        keyPoints: [
          'Four transforms: FT, Fourier series, DTFT, DFT.',
          'Complex forms unify notation and phase handling.',
          'The DFT is the finite, periodic, computable member of the family.',
        ],
      },
      {
        id: '31.5', title: 'Why the Complex Fourier Transform is Used', page: 577, level: 'core',
        intuition: `Complex notation is compact, symmetric, and algebraically powerful. It makes phase, modulation, and negative frequencies explicit instead of hiding them in trigonometric identities.`,
        detail: `The complex DFT turns convolution into multiplication, time shifts into phase factors, and modulation into frequency shifts—with one set of formulas instead of separate sine/cosine cases. It handles complex signals (e.g., quadrature baseband, analytic signals) that the real DFT cannot represent. It makes negative frequencies explicit, which is essential for understanding sampling and modulation. It is the natural bridge to the Laplace and z-transforms. The cost is that the values are complex and less immediately intuitive; the book recommends understanding the real DFT first, then adopting the complex form for its power.`,
        keyPoints: [
          'Compact algebra for convolution, shifts, and modulation.',
          'Represents complex signals and negative frequencies naturally.',
          'Bridge to Laplace and z-transforms.',
          'Requires comfort with complex arithmetic.',
        ],
        application: `Quadrature communications, analytic signals, radar, and advanced filter design.`,
      },
    ],
    labs: [{
      id: 'complex-dft',
      title: 'The complex spectrum, including negative frequencies',
      intro: 'Compute the complex DFT of real and complex signals. Inspect magnitude and phase on a centered frequency axis, and verify conjugate symmetry for real inputs.',
      tasks: [
        'Transform a real cosine. Where are the positive and negative frequency peaks?',
        'Transform a complex exponential. How many peaks remain?',
        'Multiply two complex spectra and inverse-transform. What time-domain operation does this perform?',
      ],
    }],
    worked: {
      title: 'Complex DFT of a real cosine',
      problem: 'Compute the 8-point complex DFT of $x[n]=\\cos(2\\pi\\cdot2n/8)$ and identify the nonzero bins.',
      steps: [
        { title: 'Use Euler’s formula', text: '$\\cos(2\\pi\\cdot2n/8)=\\frac12(e^{j2\\pi\\cdot2n/8}+e^{-j2\\pi\\cdot2n/8})$.' },
        { title: 'Match to DFT basis', text: 'The first term is bin $k=2$ with coefficient $1/2N$? Careful: the DFT sum of $e^{j2\\pi kn/N}$ is N at bin k. So $X[2]=N/2=4$, and $X[6]=4$ (since $e^{-j2\\pi2n/8}=e^{j2\\pi6n/8}$).' },
        { title: 'Check symmetry', text: 'For a real signal, $X[8-2]=X[6]=X^*[2]=4$. Correct.' },
        { title: 'List the bins', text: 'All other bins are zero: $X=[0,0,4,0,0,0,4,0]$.' },
      ],
      answer: 'The complex DFT has two nonzero bins: $X[2]=4$ and $X[6]=4$. The real DFT would report a single cosine amplitude of 1 at bin 2, hiding the conjugate pair.',
    },
    misconceptions: [
      { wrong: 'The complex DFT gives twice as much information as the real DFT.', right: 'For a real signal, half the complex bins are redundant conjugates. The information content is the same; the representation is different.' },
      { wrong: 'Negative frequency bins are errors or noise.', right: 'They are the conjugate half of a real signal’s spectrum, required for correct amplitude and phase.' },
      { wrong: 'The complex DFT is only for complex signals.', right: 'It works for real signals too and is often used because it is algebraically cleaner and supports FFT algorithms.' },
    ],
    takeaways: [
      'The complex DFT is the general form; the real DFT is a one-sided special case.',
      'Real signals produce conjugate-symmetric complex spectra.',
      'Complex notation makes convolution, modulation, and phase shifts algebraic.',
      'The complex DFT is the bridge to the Laplace and z-transforms.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'For a real 8-point signal, which complex DFT bins are conjugates?',
        options: ['k and k+1', 'k and 8−k', 'k and 2k', 'all bins are independent'],
        answer: 1,
        explanation: 'Conjugate symmetry gives X[8−k]=X*[k]. Bins 1 and 7, 2 and 6, 3 and 5 are pairs; bins 0 and 4 are real.',
        wrongHints: { 0: 'Adjacent bins are not conjugate pairs in general.', 2: 'Doubling the index does not represent the same frequency.', 3: 'Only N/2+1 bins are independent for a real signal.' },
      },
      {
        type: 'mcq', question: 'A real cosine at bin 3 of an N-point complex DFT produces:',
        options: ['one nonzero bin at 3', 'two conjugate bins at 3 and N−3', 'N nonzero bins', 'only a DC bin'],
        answer: 1,
        explanation: 'A real cosine is the sum of positive- and negative-frequency complex exponentials, producing conjugate peaks at k=3 and k=N−3.',
        wrongHints: { 0: 'That would be a complex exponential, not a real cosine.', 2: 'A pure cosine has only two frequency components.', 3: 'DC would require a constant signal.' },
      },
      {
        type: 'tf', question: 'The complex DFT’s inverse transform includes a 1/N scaling factor.',
        options: ['True', 'False'], answer: 0,
        explanation: 'With the forward transform using e^{−j2πkn/N}, the inverse uses e^{+j2πkn/N} and a 1/N factor so the round trip is identity.',
      },
    ],
  },

  {
    number: 32,
    title: 'The Laplace Transform',
    part: 'Complex Techniques',
    tagline: 'The s-plane: poles, zeros, stability, and analog filter design.',
    intro: `The Laplace transform extends the Fourier transform to damped and growing signals by replacing $j\\omega$ with a complex variable $s=\\sigma+j\\omega$. It turns differential equations into algebra and makes stability visible as a geometric property: poles in the left half-plane are stable.

This chapter introduces the s-domain, the transform strategy, circuit analysis, the meaning of poles and zeros, and analog filter design. It is the continuous-time counterpart of the z-transform and the foundation of classical filter theory.`,
    objectives: [
      'Define the Laplace transform and the s-plane.',
      'Convert differential equations to transfer functions.',
      'Interpret poles, zeros, stability, and frequency response.',
      'Analyze RC/RLC circuits in the s-domain.',
      'Design analog Butterworth/Chebyshev prototypes.',
    ],
    prerequisites: [13, 20, 30],
    sections: [
      {
        id: '32.1', title: 'The Nature of the s-Domain', page: 581, level: 'core',
        intuition: `The Laplace variable $s=\\sigma+j\\omega$ combines decay/growth ($\\sigma$) with oscillation ($\\omega$). The s-plane is a map of all damped sinusoids.`,
        detail: `The bilateral Laplace transform is $X(s)=\\int_{-\\infty}^{\\infty}x(t)e^{-st}\\,dt$. For causal signals, the one-sided form integrates from 0 to ∞. The transform exists where the integral converges—the region of convergence (ROC). Setting $s=j\\omega$ (the imaginary axis) reduces it to the Fourier transform, provided the ROC includes the axis. A pole at $s=-\\sigma_0+j\\omega_0$ corresponds to a damped sinusoid $e^{-\\sigma_0 t}\\cos(\\omega_0 t)$. The left half-plane represents decaying signals, the right half-plane growing signals, and the imaginary axis sustained oscillation. This geometry is the key to stability and filter design.`,
        formulas: [
          { label: 'Laplace transform', tex: 'X(s)=\\int_{0}^{\\infty}x(t)e^{-st}\\,dt', vars: 's = σ + jω; causal one-sided form' },
          { label: 'Inverse transform', tex: 'x(t)=\\frac{1}{2\\pi j}\\int_{c-j\\infty}^{c+j\\infty}X(s)e^{st}\\,ds', vars: 'Bromwich contour in the ROC' },
        ],
        keyPoints: [
          's = σ + jω: real part controls decay/growth, imaginary part oscillation.',
          'The imaginary axis is the Fourier transform (when the ROC includes it).',
          'Left half-plane poles decay; right half-plane poles grow.',
        ],
      },
      {
        id: '32.2', title: 'Strategy of the Laplace Transform', page: 588, level: 'core',
        intuition: `Differentiate in time becomes multiply by s. That single rule turns a differential equation into an algebraic equation for the transfer function.`,
        detail: `The Laplace transform converts differentiation to multiplication: $\\mathcal{L}\\{dx/dt\\}=sX(s)-x(0^-)$. For zero initial conditions, a linear differential equation becomes a ratio of polynomials, $H(s)=Y(s)/X(s)$. The numerator roots are zeros; the denominator roots are poles. Inverse Laplace transforms—often by partial fractions—recover the time-domain response. Initial conditions appear as extra terms; for transfer-function analysis, they are usually set to zero. The strategy is: transform, solve algebraically, factor, inverse-transform. This is much easier than solving differential equations directly and reveals stability and frequency response geometrically.`,
        formulas: [
          { label: 'Derivative property', tex: '\\mathcal{L}\\left\\{\\frac{dx}{dt}\\right\\}=sX(s)-x(0^-)', vars: 'Initial condition term' },
          { label: 'Transfer function', tex: 'H(s)=\\frac{Y(s)}{X(s)}=\\frac{b_ms^m+\\cdots+b_0}{a_ns^n+\\cdots+a_0}', vars: 'Zero initial conditions' },
        ],
        keyPoints: [
          'Differentiation → multiplication by s.',
          'Transfer function = ratio of output to input transforms.',
          'Zeros are numerator roots; poles are denominator roots.',
        ],
      },
      {
        id: '32.3', title: 'Analysis of Electric Circuits', page: 592, level: 'core',
        intuition: `Replace each component with its s-domain impedance, solve the circuit algebraically, and read the transfer function.`,
        detail: `In the s-domain, $Z_R=R$, $Z_L=sL$, $Z_C=1/(sC)$. Inductors and capacitors can have initial-condition sources, but for transfer functions we assume zero initial energy. Series/parallel rules and Kirchhoff’s laws apply as in DC. A voltage divider gives $H(s)$ directly. For an RC low-pass, $H(s)=1/(1+sRC)$, with a pole at $s=-1/(RC)$ and a −3 dB frequency $\\omega_c=1/(RC)$. For an RLC circuit, the denominator is second order; the pole locations determine damping (overdamped, critically damped, underdamped) and resonance. The s-domain makes these behaviors visible without solving differential equations.`,
        formulas: [
          { label: 's-domain impedances', tex: 'Z_R=R,\\quad Z_L=sL,\\quad Z_C=\\frac{1}{sC}', vars: 'Zero initial conditions' },
          { label: 'RC low-pass', tex: 'H(s)=\\frac{1}{1+sRC}', vars: 'Pole at s=−1/(RC)' },
        ],
        keyPoints: [
          'Use s-domain impedances and ordinary circuit algebra.',
          'RC low-pass has one real pole; RLC has a second-order denominator.',
          'Pole locations determine damping and resonance.',
        ],
        application: `Analog filter design, control-system modeling, and circuit stability analysis.`,
      },
      {
        id: '32.4', title: 'The Importance of Poles and Zeros', page: 597, level: 'core',
        intuition: `Poles are the system’s natural ringing frequencies; zeros are frequencies it blocks. Their locations tell you stability, speed, and shape without solving for the time response.`,
        detail: `A pole at $s=p$ contributes a mode $e^{pt}$; if $\\mathrm{Re}(p)<0$, it decays; if $>0$, it grows; if $=0$, it oscillates forever. A conjugate pole pair gives a damped sinusoid with frequency $\\mathrm{Im}(p)$ and decay rate $|\\mathrm{Re}(p)|$. Zeros shape the relative weighting of modes and can cancel poles (if not exactly canceled, they create a zero in the frequency response). The frequency response is $H(j\\omega)$, evaluated along the imaginary axis; peaks near poles, dips near zeros. Stability of a causal continuous-time system requires all poles in the left half-plane. The s-plane plot is therefore a complete qualitative design tool.`,
        formulas: [
          { label: 'Pole mode', tex: 'e^{pt}=e^{\\sigma t}e^{j\\omega t}', vars: 'p = σ + jω' },
          { label: 'Stability criterion', tex: '\\mathrm{Re}(p_i)<0\\ \\text{for all poles}', vars: 'Causal continuous-time system' },
        ],
        keyPoints: [
          'Poles determine natural modes, decay rates, and stability.',
          'Zeros shape the frequency response and can block frequencies.',
          'Frequency response = H(s) evaluated at s=jω.',
          'Left half-plane poles = stable.',
        ],
        application: `Control-loop stability, analog filter design, and resonance analysis.`,
      },
      {
        id: '32.5', title: 'Filter Design in the s-Domain', page: 600, level: 'advanced',
        intuition: `Design the analog prototype by placing poles on a circle (Butterworth) or an ellipse (Chebyshev), then transform it to a digital filter.`,
        detail: `Classical analog filter design starts with a normalized low-pass prototype. Butterworth poles lie on a circle in the left half-plane; Chebyshev poles lie on an ellipse, with the eccentricity set by the ripple. The prototype is scaled to the desired cutoff and converted to high-pass, band-pass, or band-reject by frequency transformations. To obtain a digital filter, apply the bilinear transform $s=\\frac{2}{T}\\frac{1-z^{-1}}{1+z^{-1}}$, which maps the left half-plane to the unit circle’s interior and the imaginary axis to the unit circle. Frequency warping is corrected by prewarping the cutoff: $\\Omega=\\frac{2}{T}\\tan(\\omega T/2)$. The result is a recursive digital filter with the desired magnitude response. The book uses this in Chapter 33 to derive Chebyshev coefficients.`,
        formulas: [
          { label: 'Bilinear transform', tex: 's=\\frac{2}{T}\\frac{1-z^{-1}}{1+z^{-1}}', vars: 'Maps left half-plane → unit disk' },
          { label: 'Prewarping', tex: '\\Omega=\\frac{2}{T}\\tan\\!\\left(\\frac{\\omega T}{2}\\right)', vars: 'Match analog and digital cutoff' },
          { label: 'Butterworth poles', tex: 'p_k=e^{j\\pi(2k+n+1)/(2n)}', vars: 'Left half-plane, unit circle' },
        ],
        keyPoints: [
          'Design an analog prototype, then transform to digital.',
          'Butterworth poles on a circle; Chebyshev on an ellipse.',
          'Bilinear transform maps the left half-plane into the unit disk.',
          'Prewarp the cutoff to correct frequency distortion.',
        ],
        caveat: `The bilinear transform compresses the infinite analog frequency axis onto the finite digital band. Prewarping fixes the cutoff but not the entire shape; check the full response.`,
        application: `Designing IIR filters from classical analog prototypes (Butterworth, Chebyshev, elliptic).`,
      },
    ],
    labs: [{
      id: 'laplace',
      title: 'Poles, zeros, and the s-plane',
      intro: 'Place poles and zeros in the s-plane and watch the frequency response and step response change. Compare Butterworth and Chebyshev pole patterns.',
      tasks: [
        'Move a pole from the left half-plane to the right. When does the system become unstable?',
        'Place a zero near the imaginary axis. What happens to the frequency response there?',
        'Compare a Butterworth and a Chebyshev pole pattern at the same order. Which has poles closer to the imaginary axis?',
      ],
    }],
    worked: {
      title: 'Find the step response of an RC low-pass',
      problem: 'An RC low-pass has $H(s)=1/(1+sRC)$ with $R=1\\ \\mathrm{k}\\Omega$, $C=1\\ \\mu\\mathrm{F}$. Find the pole, the time constant, and the step response.',
      steps: [
        { title: 'Compute the pole', text: '$RC=10^3\\times10^{-6}=10^{-3}$ s. The pole is at $s=-1/(RC)=-1000$ rad/s.' },
        { title: 'Write the step response transform', text: 'For a unit step $X(s)=1/s$, $Y(s)=\\frac{1}{s(1+sRC)}$.' },
        { title: 'Partial fractions', text: '$Y(s)=\\frac{1}{s}-\\frac{RC}{1+sRC}=\\frac1s-\\frac{1}{s+1/(RC)}$.' },
        { title: 'Inverse transform', text: '$y(t)=1-e^{-t/(RC)}=1-e^{-1000t}$ for $t\\ge0$.' },
      ],
      answer: 'Pole at −1000 rad/s, time constant 1 ms. The step response rises as $1-e^{-1000t}$ and reaches 63.2% at 1 ms.',
    },
    misconceptions: [
      { wrong: 'A pole on the imaginary axis is stable.', right: 'A pole exactly on the imaginary axis produces sustained oscillation (marginally stable). Any perturbation or damping error can make it grow or decay.' },
      { wrong: 'Zeros do not affect stability.', right: 'Zeros do not determine stability directly, but they shape the response and can cancel poles. Pole-zero cancellation in a controller can hide an unstable mode.' },
      { wrong: 'The Laplace transform is only for continuous-time systems.', right: 'It is the continuous-time counterpart of the z-transform. Digital filters use the z-transform, but the s-domain is used for analog prototypes and bilinear design.' },
    ],
    takeaways: [
      'Laplace transform converts differential equations into algebra via s.',
      'Poles and zeros determine stability, natural modes, and frequency response.',
      'Left half-plane poles are stable; the imaginary axis is marginal.',
      'Classical analog prototypes (Butterworth, Chebyshev) are designed in the s-plane.',
      'The bilinear transform converts analog prototypes to digital filters with prewarping.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'A causal continuous-time system is stable if all poles lie:',
        options: ['on the imaginary axis', 'in the right half-plane', 'in the left half-plane', 'at the origin'],
        answer: 2,
        explanation: 'Left half-plane poles have negative real parts, so their modes decay. Right half-plane poles grow; imaginary-axis poles oscillate forever.',
        wrongHints: { 0: 'Imaginary-axis poles are marginally stable, not asymptotically stable.', 1: 'Right half-plane poles grow without bound.', 3: 'A pole at the origin is a pure integrator, marginally stable.' },
      },
      {
        type: 'mcq', question: 'The bilinear transform maps the analog left half-plane to:',
        options: ['the unit circle', 'the interior of the unit circle', 'the right half-plane', 'the real axis'],
        answer: 1,
        explanation: 'The bilinear transform maps the stable left half-plane into the stable region inside the unit circle, preserving stability.',
        wrongHints: { 0: 'The imaginary axis maps to the unit circle.', 2: 'That would not preserve stability.', 3: 'Only special points map to the real axis.' },
      },
      {
        type: 'tf', question: 'Setting s=jω in the Laplace transform gives the Fourier transform, provided the region of convergence includes the imaginary axis.',
        options: ['True', 'False'], answer: 0,
        explanation: 'The Fourier transform is the Laplace transform evaluated on the imaginary axis, valid when the ROC includes that axis.',
      },
    ],
  },

  {
    number: 33,
    title: 'The z-Transform',
    part: 'Complex Techniques',
    tagline: 'The discrete-time s-plane: recursion, stability, and digital filter design.',
    intro: `The z-transform is to discrete-time systems what the Laplace transform is to continuous-time systems. It converts difference equations into algebra, represents delays as $z^{-1}$, and turns stability into a geometric condition: all poles inside the unit circle.

This chapter develops the z-domain, analyzes recursive systems, factors transfer functions into cascade and parallel stages, explains spectral inversion and gain changes, derives Chebyshev/Butterworth digital filters via the bilinear transform, and closes with a reflection on the best and worst of DSP.`,
    objectives: [
      'Define the z-transform and relate z to s.',
      'Analyze recursive systems using H(z), poles, and zeros.',
      'Implement cascade and parallel structures.',
      'Use spectral inversion and gain scaling.',
      'Design digital Chebyshev/Butterworth filters via the bilinear transform.',
    ],
    prerequisites: [19, 20, 30, 31, 32],
    sections: [
      {
        id: '33.1', title: 'The Nature of the z-Domain', page: 605, level: 'core',
        intuition: `The z-transform replaces a one-sample delay with $z^{-1}$. The unit circle is the digital frequency axis, and the interior of the unit circle is the stable region.`,
        detail: `The two-sided z-transform is $X(z)=\\sum_{n=-\\infty}^{\\infty}x[n]z^{-n}$; for causal signals, the sum starts at 0. The substitution $z=e^{sT}$ maps the s-plane to the z-plane: the left half-plane becomes the interior of the unit circle, the imaginary axis becomes the unit circle, and the right half-plane becomes the exterior. The unit circle is therefore the digital frequency axis, with $z=e^{j\\omega}$. A delay of one sample is multiplication by $z^{-1}$. The region of convergence determines whether the transform exists; for causal systems, it is outside the outermost pole. Stability requires the ROC to include the unit circle, which for a causal system means all poles inside it.`,
        formulas: [
          { label: 'z-transform', tex: 'X(z)=\\sum_{n=0}^{\\infty}x[n]z^{-n}', vars: 'Causal one-sided form' },
          { label: 's-to-z mapping', tex: 'z=e^{sT}', vars: 'T = sampling interval' },
          { label: 'Unit circle', tex: 'z=e^{j\\omega},\\quad \\omega=2\\pi f/f_s', vars: 'Digital frequency axis' },
        ],
        keyPoints: [
          'z⁻¹ = one-sample delay.',
          'Unit circle = digital frequency axis.',
          'Left half-plane maps inside the unit circle; stability = poles inside.',
        ],
      },
      {
        id: '33.2', title: 'Analysis of Recursive Systems', page: 610, level: 'core',
        intuition: `Take the z-transform of a difference equation and solve for H(z). The poles and zeros tell you stability and frequency response.`,
        detail: `For $y[n]=\\sum a_k x[n-k]-\\sum b_k y[n-k]$, the z-transform gives $H(z)=\\frac{\\sum a_k z^{-k}}{1+\\sum b_k z^{-k}}$. The numerator roots are zeros; the denominator roots are poles. The frequency response is $H(e^{j\\omega})$, evaluated on the unit circle. A causal system is stable if all poles are strictly inside the unit circle. The inverse z-transform can be found by partial fractions, power series, or contour integration; for design, the pole-zero form and frequency response are usually more useful. The z-transform also handles initial conditions and transient responses, but transfer-function analysis assumes zero initial state.`,
        formulas: [
          { label: 'Transfer function', tex: 'H(z)=\\frac{\\sum_{k=0}^{P}a_k z^{-k}}{1+\\sum_{k=1}^{Q}b_k z^{-k}}', vars: 'a = feedforward, b = feedback' },
          { label: 'Frequency response', tex: 'H(e^{j\\omega})=\\left.H(z)\\right|_{z=e^{j\\omega}}', vars: 'Evaluate on the unit circle' },
          { label: 'Stability', tex: '|p_i|<1\\ \\text{for all poles}', vars: 'Causal system' },
        ],
        keyPoints: [
          'Difference equation → rational H(z).',
          'Poles inside the unit circle = stable.',
          'Frequency response is H(z) on the unit circle.',
        ],
        application: `Analyzing and designing IIR filters, control loops, and recursive estimators.`,
      },
      {
        id: '33.3', title: 'Cascade and Parallel Stages', page: 616, level: 'core',
        intuition: `A high-order transfer function can be factored into second-order sections. Implement them one after another (cascade) or side by side (parallel).`,
        detail: `Factoring $H(z)$ into first- and second-order sections improves numerical stability and simplifies scaling. A cascade multiplies the section transfer functions, $H(z)=\\prod_i H_i(z)$; a parallel form adds them, $H(z)=\\sum_i H_i(z)$. Cascade biquads are the standard implementation for high-order IIR filters because each section’s poles can be kept away from the unit circle and its gain scaled independently. Parallel forms are useful when the partial-fraction expansion is natural, and can reduce sensitivity to coefficient quantization. The book presents the algebra and explains why direct-form high-order recursion is a bad idea in finite precision.`,
        formulas: [
          { label: 'Cascade', tex: 'H(z)=\\prod_{i=1}^{K}H_i(z)', vars: 'Multiply section responses' },
          { label: 'Parallel', tex: 'H(z)=\\sum_{i=1}^{K}H_i(z)', vars: 'Add section responses' },
        ],
        keyPoints: [
          'Cascade: multiply sections; parallel: add sections.',
          'Biquad cascades improve numerical stability and scaling.',
          'High-order direct-form recursion is sensitive to coefficient quantization.',
        ],
        application: `Implementing Chebyshev/Butterworth IIR filters as cascaded biquads.`,
      },
      {
        id: '33.4', title: 'Spectral Inversion', page: 619, level: 'core',
        intuition: `Subtract a low-pass response from an all-pass response and you get a high-pass. The same trick converts band-reject to band-pass.`,
        detail: `Spectral inversion in the z-domain is $H_{HP}(z)=1-H_{LP}(z)$ (or, in the time domain, $h_{HP}[n]=\\delta[n]-h_{LP}[n]$). This flips the passband and stopband while preserving the transition width. If the original filter has linear phase (symmetric kernel), the inverted filter also has linear phase. For band-pass/band-reject, you can invert a band-reject to get a band-pass, or combine low-pass and high-pass sections. The book uses spectral inversion to build high-pass and band-pass filters from low-pass prototypes, including the windowed-sinc examples of Chapter 16. The z-domain view shows that inversion is exact for any stable filter, provided the resulting response is realizable.`,
        formulas: [
          { label: 'Spectral inversion', tex: 'H_{HP}(z)=1-H_{LP}(z)', vars: 'Flip passband and stopband' },
          { label: 'Time-domain form', tex: 'h_{HP}[n]=\\delta[n]-h_{LP}[n]', vars: 'For FIR kernels' },
        ],
        keyPoints: [
          'Inversion: H → 1−H.',
          'Preserves transition width and (for symmetric FIR) linear phase.',
          'Converts low-pass↔high-pass and band-reject↔band-pass.',
        ],
        application: `Building high-pass/band-pass filters from low-pass prototypes.`,
      },
      {
        id: '33.5', title: 'Gain Changes', page: 621, level: 'core',
        intuition: `Scaling a filter’s coefficients scales its output. Normalize the gain at DC or at the passband center, and leave headroom so intermediate stages do not overflow.`,
        detail: `Multiplying $H(z)$ by a constant scales the magnitude but not the phase. For a low-pass filter, it is common to normalize $H(1)=1$ (unity DC gain); for a high-pass, normalize $H(-1)=1$ (Nyquist gain); for a band-pass, normalize at the center frequency. In a cascade, each section should be scaled to avoid overflow while preserving the overall gain. Fixed-point implementations need headroom analysis: the maximum intermediate value can exceed the final output, especially in high-Q sections. Gain changes also affect quantization noise and limit cycles. The book emphasizes that normalization is part of the design, not an afterthought.`,
        formulas: [
          { label: 'DC normalization', tex: 'H(1)=\\sum_k h[k]=1', vars: 'Low-pass unity gain' },
          { label: 'Nyquist normalization', tex: 'H(-1)=\\sum_k (-1)^k h[k]=1', vars: 'High-pass unity gain' },
        ],
        keyPoints: [
          'Scale coefficients to normalize gain at a reference frequency.',
          'Cascade sections need per-stage headroom scaling.',
          'Normalization affects overflow and quantization noise.',
        ],
        application: `Fixed-point IIR implementation and multi-stage filter design.`,
      },
      {
        id: '33.6', title: 'Chebyshev-Butterworth Filter Design', page: 623, level: 'advanced',
        intuition: `Start with an analog prototype, map its poles through the bilinear transform, and read off the digital recursion coefficients. The z-plane shows why the result is stable.`,
        detail: `The design procedure: choose low-pass/high-pass, cutoff, ripple, and order; form the analog prototype (Butterworth poles on a circle, Chebyshev on an ellipse); prewarp the cutoff; apply the bilinear transform $s=\\frac{2}{T}\\frac{1-z^{-1}}{1+z^{-1}}$; map the poles to the z-plane; expand the denominator polynomial; and normalize the gain. The left half-plane maps inside the unit circle, so the digital filter is stable if the analog prototype is. The book presents tables and a coefficient-calculation routine, and notes that high-order/low-cutoff designs can be unstable in single precision. Cascading biquads and using double precision extend the stable range. The z-domain view explains both the design and its numerical limits.`,
        formulas: [
          { label: 'Bilinear map of a pole', tex: 'z_k=\\frac{1+\\Omega_p p_k}{1-\\Omega_p p_k}', vars: 'Prewarped analog pole p_k' },
          { label: 'Digital transfer function', tex: 'H(z)=K\\frac{(1+z^{-1})^N}{\\prod_k(1-z_k z^{-1})}', vars: 'All-pole low-pass prototype' },
        ],
        keyPoints: [
          'Analog prototype → prewarp → bilinear transform → z-domain coefficients.',
          'Left half-plane poles map inside the unit circle.',
          'High-order/low-cutoff filters need higher precision or biquad cascades.',
        ],
        caveat: `The bilinear transform warps the frequency axis. Prewarping matches the cutoff, but the shape away from cutoff is compressed; verify the full response.`,
      },
      {
        id: '33.7', title: 'The Best and Worst of DSP', page: 630, level: 'core',
        intuition: `DSP’s strength is precise, repeatable, flexible manipulation of information. Its weakness is that it can only work with what the ADC captured—and it can fail silently if sampling, scaling, or stability is wrong.`,
        detail: `The book closes by weighing DSP’s advantages—precision, reproducibility, flexibility, and the ability to implement algorithms that are impractical in analog hardware—against its limitations: sampling and aliasing, quantization, real-time constraints, power, and complexity. DSP is not magic; it is engineering with numbers. The most common failures are not exotic algorithms but basic mistakes: inadequate anti-alias filtering, overflow, unstable recursion, wrong scaling, or ignoring the analog interface. The best DSP engineers understand both the mathematics and the physical signal chain. The field continues to expand into machine learning, massive MIMO, computational imaging, and embedded AI, but the fundamentals in this book remain the foundation.`,
        keyPoints: [
          'DSP offers precision, repeatability, and flexibility.',
          'Its limits are sampling, quantization, real-time constraints, and the analog interface.',
          'Most failures are basic engineering errors, not exotic mathematics.',
          'Fundamentals remain relevant as applications expand.',
        ],
        application: `Every digital product that senses, communicates, images, or controls.`,
      },
    ],
    labs: [{
      id: 'zplane',
      title: 'Poles, zeros, and digital stability',
      intro: 'Place poles and zeros in the z-plane and inspect the frequency response, impulse response, and stability. Design a Chebyshev filter and watch its analog poles map inside the unit circle.',
      tasks: [
        'Move a pole outside the unit circle. What happens to the impulse response?',
        'Place a zero on the unit circle. Which frequency is blocked?',
        'Increase the filter order at a low cutoff. Do the digital poles remain inside the unit circle?',
      ],
    }],
    worked: {
      title: 'Analyze a first-order recursive filter',
      problem: 'A system is $y[n]=0.2x[n]+0.8y[n-1]$. Find H(z), the pole, the impulse response, and determine stability.',
      steps: [
        { title: 'Take the z-transform', text: '$Y(z)=0.2X(z)+0.8z^{-1}Y(z)$.' },
        { title: 'Solve for H(z)', text: '$H(z)=\\frac{Y(z)}{X(z)}=\\frac{0.2}{1-0.8z^{-1}}$.' },
        { title: 'Find the pole', text: 'The denominator is zero at $z=0.8$. The pole is at 0.8, inside the unit circle.' },
        { title: 'Impulse response', text: '$h[n]=0.2(0.8)^n u[n]$. It decays geometrically.' },
        { title: 'Check stability', text: '$|0.8|<1$, so the system is stable. The DC gain is $H(1)=0.2/(1-0.8)=1$.' },
      ],
      answer: 'H(z)=0.2/(1−0.8z⁻¹), pole at z=0.8, h[n]=0.2(0.8)ⁿu[n]. Stable, unity DC gain, with a time constant of about 4.5 samples.',
    },
    misconceptions: [
      { wrong: 'The z-transform is just the Laplace transform with a different letter.', right: 'z=e^{sT} maps the s-plane to the z-plane, but the z-transform applies to discrete sequences and has its own ROC and unit-circle geometry. The mapping is many-to-one in the imaginary direction (periodicity).' },
      { wrong: 'A pole inside the unit circle guarantees a good filter.', right: 'Stability is necessary but not sufficient. The pole locations also determine bandwidth, ringing, and sensitivity to coefficient quantization.' },
      { wrong: 'High-order filters are always better because they are closer to ideal.', right: 'High order concentrates poles and increases numerical sensitivity. Cascaded biquads and adequate precision are essential.' },
    ],
    takeaways: [
      'z⁻¹ is a one-sample delay; the unit circle is the digital frequency axis.',
      'H(z)=B(z)/A(z); poles inside the unit circle = stable causal system.',
      'Cascade/parallel factorizations improve numerical robustness.',
      'Spectral inversion and gain normalization are practical design tools.',
      'Bilinear-transform design maps analog prototypes to stable digital filters.',
      'DSP is powerful but bounded by sampling, quantization, and the analog interface.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'A causal digital filter is stable if all poles are:',
        options: ['outside the unit circle', 'inside the unit circle', 'on the unit circle', 'at z=1'],
        answer: 1,
        explanation: 'Poles inside the unit circle produce decaying modes. Outside, they grow; on the circle, they oscillate forever (marginally stable).',
        wrongHints: { 0: 'Outside the unit circle is unstable for a causal system.', 2: 'On the circle is marginal, not asymptotically stable.', 3: 'A pole at z=1 is an integrator, marginally stable.' },
      },
      {
        type: 'mcq', question: 'In the z-domain, spectral inversion to obtain a high-pass filter is:',
        options: ['H_HP(z)=H_LP(z)²', 'H_HP(z)=1−H_LP(z)', 'H_HP(z)=H_LP(−z)', 'H_HP(z)=1/H_LP(z)'],
        answer: 1,
        explanation: 'Subtracting the low-pass response from an all-pass response flips the passband and stopband, producing a high-pass filter.',
        wrongHints: { 0: 'Squaring sharpens but does not invert the response.', 2: 'H_LP(−z) flips the frequency axis and can produce a high-pass, but the standard spectral inversion is 1−H_LP(z).', 3: '1/H_LP is an inverse filter, not a spectral inversion.' },
      },
      {
        type: 'tf', question: 'The bilinear transform maps the analog left half-plane into the interior of the unit circle.',
        options: ['True', 'False'], answer: 0,
        explanation: 'This mapping preserves stability: stable analog poles become stable digital poles. The imaginary axis maps to the unit circle.',
      },
    ],
  },
];
