/**
 * Part II — Fundamentals (chapters 5–13)
 */

export const part2 = [
  {
    number: 5,
    title: 'Linear Systems',
    part: 'Fundamentals',
    tagline: 'Superposition is the divide-and-conquer idea that makes DSP possible.',
    intro: `Most DSP techniques rest on one deceptively simple property: a linear system's response to a sum of inputs is the sum of its responses to each input. If you can decompose a complicated signal into simple pieces, process each piece, and add the results, you can analyze systems that would otherwise be intractable.

This chapter defines linearity precisely, separates it from the informal “straight line” idea, explains sinusoidal fidelity, and shows how impulse, Fourier, and step decompositions turn superposition into practical algorithms. It closes by acknowledging that many important systems are not linear—and by explaining when nonlinear methods are the right choice.`,
    objectives: [
      'State the additivity and homogeneity requirements for linearity.',
      'Distinguish linear, affine, and nonlinear systems.',
      'Explain sinusoidal fidelity and why nonlinear systems create new frequencies.',
      'Use superposition with impulse, sinusoidal, and step decompositions.',
      'Recognize when a nonlinear method is preferable.',
    ],
    prerequisites: [2, 3],
    sections: [
      {
        id: '5.1', title: 'Signals and Systems', page: 87, level: 'core',
        intuition: `A system is any process that turns an input signal into an output signal. The same mathematics describes an electronic filter, a room's acoustics, an image blur, and a financial smoothing rule.`,
        detail: `We represent a system as a transformation $y[n]=T\\{x[n]\\}$. The input and output may be continuous or discrete, scalar or multidimensional. A system can be described by a block diagram, a difference equation, an impulse response, or a frequency response; these are different views of the same input–output relationship. The book distinguishes systems with memory (output depends on past inputs or outputs) from memoryless systems, and causal systems (output depends only on present and past) from noncausal ones. DSP usually deals with causal, discrete-time systems that can be implemented in real time, but analysis often uses noncausal idealizations.`,
        formulas: [
          { label: 'System transformation', tex: 'y[n] = T\\{x[n]\\}', vars: 'T = system operator' },
        ],
        keyPoints: [
          'A system maps an input signal to an output signal.',
          'Impulse response, difference equation, and frequency response are equivalent descriptions for linear systems.',
          'Causality and memory are separate properties from linearity.',
        ],
      },
      {
        id: '5.2', title: 'Requirements for Linearity', page: 89, level: 'core',
        intuition: `Linearity means two things: scaling the input scales the output by the same factor, and adding inputs adds their outputs. Nothing else is allowed.`,
        detail: `A system $T$ is linear if, for all allowed inputs and constants, it satisfies homogeneity (scaling), $T\\{a x[n]\\}=aT\\{x[n]\\}$, and additivity, $T\\{x_1[n]+x_2[n]\\}=T\\{x_1[n]\\}+T\\{x_2[n]\\}$. Together these give superposition: $T\\{a x_1+b x_2\\}=aT\\{x_1\\}+bT\\{x_2\\}$. A consequence is that a zero input must produce a zero output. A system described by $y=kx+b$ with $b\\ne0$ is *affine*, not linear, even though its graph is a straight line; the offset breaks homogeneity and additivity. The book stresses that linearity is a property of the entire system, including its initial conditions and allowed signal range.`,
        formulas: [
          { label: 'Homogeneity', tex: 'T\\{a\\,x[n]\\}=a\\,T\\{x[n]\\}', vars: 'a = constant' },
          { label: 'Additivity', tex: 'T\\{x_1[n]+x_2[n]\\}=T\\{x_1[n]\\}+T\\{x_2[n]\\}', vars: 'x₁, x₂ = arbitrary inputs' },
          { label: 'Superposition', tex: 'T\\{a x_1+b x_2\\}=aT\\{x_1\\}+bT\\{x_2\\}', vars: 'Follows from the two requirements' },
        ],
        keyPoints: [
          'Scaling and additivity must both hold for all inputs.',
          'Zero input → zero output is a quick necessary check.',
          'A straight-line graph with a nonzero intercept is affine, not linear.',
        ],
        caveat: `Linearity can hold only over a restricted range—an amplifier is linear until it clips. Always ask “linear over what input range?”`,
      },
      {
        id: '5.3', title: 'Static Linearity and Sinusoidal Fidelity', page: 92, level: 'core',
        intuition: `Feed a linear system a pure sine and you get the same frequency back, only louder, quieter, or shifted in time. Feed it a nonlinear system and new frequencies appear.`,
        detail: `A memoryless (static) system is a function $y[n]=f(x[n])$. It is linear only if $f(x)=kx$: a straight line through the origin. The most useful consequence of linearity is *sinusoidal fidelity*: if $x[n]=A\\cos(\\omega n+\\phi)$, a linear time-invariant system produces $y[n]=A|H(\\omega)|\\cos(\\omega n+\\phi+\\angle H(\\omega))$ in steady state. The frequency is unchanged; only amplitude and phase are altered. Nonlinear systems generate harmonics, intermodulation products, and other new frequencies. This is why a distorted amplifier sounds “fuzzy” and why clipping creates spectral splatter. The book uses sinusoidal fidelity as a practical test for linearity.`,
        formulas: [
          { label: 'Static linear system', tex: 'y[n]=k\\,x[n]', vars: 'Must pass through the origin' },
          { label: 'Sinusoidal fidelity', tex: 'A\\cos(\\omega n+\\phi)\\;\\longrightarrow\\;A|H(\\omega)|\\cos(\\omega n+\\phi+\\angle H(\\omega))', vars: 'Same frequency, changed amplitude and phase' },
        ],
        keyPoints: [
          'A static system is linear only if its graph is a line through the origin.',
          'Linear systems cannot create new frequencies.',
          'Amplitude and phase response completely describe a linear system’s steady-state sinusoidal behavior.',
        ],
        caveat: `Sinusoidal fidelity describes the steady-state response. A linear system can still produce transients and delays when the input starts or changes.`,
      },
      {
        id: '5.4', title: 'Examples of Linear and Nonlinear Systems', page: 94, level: 'core',
        intuition: `A resistor, a fixed gain, and an ideal filter are linear. A diode, a clipper, a squarer, and a median filter are not. The difference is not whether the graph looks curved—it is whether superposition holds.`,
        detail: `The book classifies examples: multiplication by a constant is linear; addition of two signals is linear; convolution with a fixed kernel is linear; differentiation and integration are linear. Multiplication of two signals is nonlinear because one signal acts as a time-varying gain. A diode's exponential characteristic is nonlinear, as is a system that squares its input. A median filter is nonlinear even though it is simple and useful—it does not obey superposition. A system with a DC offset or internally generated noise is nonlinear if those contaminants are considered part of the system, but can be modeled as linear with an extra input if they enter from outside. This modeling choice matters.`,
        keyPoints: [
          'Constant gain, addition, convolution, differentiation, and integration are linear.',
          'Signal multiplication, squaring, clipping, diodes, and median filters are nonlinear.',
          'Whether an offset/noise source makes a system nonlinear depends on where you draw the system boundary.',
        ],
        application: `Audio power amplifiers are designed to stay linear over their operating range; deliberately nonlinear “tube” or “fuzz” effects are used creatively.`,
      },
      {
        id: '5.5', title: 'Special Properties of Linearity', page: 96, level: 'core',
        intuition: `Linear systems can be rearranged, cascaded, and combined with other linear systems without changing the overall input–output rule—at least in theory.`,
        detail: `The book highlights several consequences. Linear time-invariant systems in cascade commute: amplify-then-filter gives the same result as filter-then-amplify, provided both stages remain linear and time-invariant. A system with multiple inputs and outputs is linear if it is built only from linear subsystems and additions. Multiplication by a constant is linear; multiplication by a signal is not. Internally generated noise or DC offset makes a system nonlinear in the strict sense because a sinusoidal input no longer yields a pure sinusoidal output. For a linear time-invariant system, linearity and time-invariance together imply that the system is completely characterized by its impulse response: once you know the response to a delta, you can predict the response to any input via convolution. These properties underlie block-diagram algebra and filter cascades.`,
        keyPoints: [
          'Cascaded linear time-invariant systems commute in exact arithmetic.',
          'A linear time-invariant system is fully specified by its impulse response.',
          'Real hardware may violate the idealization through noise, clipping, slew limits, or drift.',
        ],
        caveat: `Commuting stages in a block diagram does not guarantee identical numerical behavior in fixed-point hardware; overflow and quantization can make the order matter.`,
      },
      {
        id: '5.6', title: 'Superposition: the Foundation of DSP', page: 98, level: 'core',
        intuition: `Break a hard problem into easy pieces, solve each piece, then add the answers. Superposition is that strategy applied to signals and systems.`,
        detail: `Superposition works in three steps: decompose the input into a sum of simple components; find the system's response to each component; add the scaled responses. The decomposition is arbitrary in principle but must be chosen so the individual responses are easy to compute. If the system is linear, the sum is exact. If it is nonlinear, superposition fails and the error can be large. The book calls superposition the foundation of DSP because impulse decomposition leads to convolution, sinusoidal decomposition leads to Fourier analysis, and step decomposition leads to step-response methods. The same physical system can be analyzed in several domains, each convenient for different questions.`,
        keyPoints: [
          'Decompose → respond → sum is valid only for linear systems.',
          'Different decompositions produce convolution, Fourier analysis, or step-response analysis.',
          'Superposition is exact in exact arithmetic, not an approximation.',
        ],
        application: `A linear filter's response to a complex audio signal is the sum of its responses to each frequency component—the basis of equalization.`,
      },
      {
        id: '5.7', title: 'Common Decompositions', page: 100, level: 'core',
        intuition: `The same signal can be built from impulses, from sinusoids, or from steps. Each building block reveals a different face of the system.`,
        detail: `Impulse decomposition writes $x[n]=\\sum_k x[k]\\delta[n-k]$. A linear system's response is then $\\sum_k x[k]h[n-k]$, which is convolution. Sinusoidal decomposition writes the signal as a sum of complex exponentials or sines and cosines; the system scales each by its frequency response, which is Fourier analysis. Step decomposition writes a signal as a sum of shifted steps, useful for transient and settling behavior. Even/odd decomposition separates a signal into symmetric and antisymmetric parts, which simplifies Fourier transforms of real signals. The book emphasizes that these are mathematical identities, not approximations: any discrete signal of finite length can be represented exactly by impulses or by a complete DFT.`,
        formulas: [
          { label: 'Impulse decomposition', tex: 'x[n]=\\sum_{k} x[k]\\,\\delta[n-k]', vars: 'Basis: shifted impulses' },
          { label: 'Fourier synthesis', tex: 'x[n]=\\frac{1}{N}\\sum_{k=0}^{N-1} X[k]\\,e^{j2\\pi kn/N}', vars: 'Basis: complex sinusoids (complex DFT form)' },
        ],
        keyPoints: [
          'Impulse decomposition → convolution.',
          'Sinusoidal decomposition → frequency response and Fourier analysis.',
          'Step and even/odd decompositions simplify specific transient and symmetry problems.',
        ],
      },
      {
        id: '5.8', title: 'Alternatives to Linearity', page: 104, level: 'advanced',
        intuition: `Not every problem is best solved with a linear filter. Sometimes the right answer is a median, a morphological operation, or a neural network.`,
        detail: `The book acknowledges that linearity is a restriction, not a universal law of nature. Nonlinear techniques can outperform linear ones when the noise is impulsive (median filtering), when shapes and edges matter (morphological processing), when the input–output relation is learned from data (neural networks), or when the signal is multiplicative (homomorphic filtering). Nonlinear systems do not obey superposition, so they require different analysis tools and are harder to characterize completely. A common compromise is to linearize a nonlinear system around an operating point, analyze the small-signal behavior, and verify the full nonlinear behavior by simulation. The key is to choose the model that matches the physics—not to force every problem into a linear mold.`,
        keyPoints: [
          'Median, morphological, neural, and homomorphic methods are deliberately nonlinear.',
          'Nonlinear systems lack superposition and are harder to analyze globally.',
          'Small-signal linearization is valid only near a chosen operating point.',
        ],
        application: `Median filtering removes salt-and-pepper image noise without blurring edges; morphological operations extract shapes; neural networks learn nonlinear classifiers.`,
      },
    ],
    labs: [{
      id: 'linearity',
      title: 'Test a system for linearity',
      intro: 'Drive a gain, a clipper, a squarer, and a median filter with two sinusoids. Compare the response to the sum with the sum of the responses, and inspect the output spectrum for new frequencies.',
      tasks: [
        'Set the gain to 1.5 and verify that superposition holds exactly.',
        'Switch to the clipper and increase the drive. Where does superposition first fail?',
        'Compare the spectrum of the squarer with the input. Which new frequencies appear, and why?',
      ],
    }],
    worked: {
      title: 'Is this system linear?',
      problem: 'A system is defined by $y[n]=2x[n]+3$. Determine whether it is linear. Then consider $y[n]=2x[n]$ and $y[n]=x[n]^2$.',
      steps: [
        { title: 'Test homogeneity for the first system', text: 'Input $a x[n]$ gives $2a x[n]+3$, while $a\\,y[n]=2a x[n]+3a$. These differ unless $a=1$.' },
        { title: 'Test additivity', text: 'For inputs $x_1$ and $x_2$, the output is $2(x_1+x_2)+3$. The sum of separate outputs is $2x_1+3+2x_2+3=2(x_1+x_2)+6$. Not equal.' },
        { title: 'Interpret', text: 'The system is affine: a linear gain plus a constant offset. It fails linearity because of the +3, even though its graph is a straight line.' },
        { title: 'Check the other two', text: '$y=2x$ satisfies both tests and is linear. $y=x^2$ fails: $(x_1+x_2)^2\\ne x_1^2+x_2^2$ in general.' },
      ],
      answer: '$y=2x+3$ is affine, not linear. $y=2x$ is linear. $y=x^2$ is nonlinear and will generate a DC term and a second harmonic for a sinusoidal input.',
    },
    misconceptions: [
      { wrong: 'A system whose graph is a straight line is always linear.', right: 'Only a line through the origin is linear. A nonzero intercept violates scaling and additivity.' },
      { wrong: 'A filter that removes noise must be linear.', right: 'Median and morphological filters remove noise but are nonlinear. Linearity is about superposition, not about usefulness.' },
      { wrong: 'Nonlinear systems are rare or unimportant.', right: 'Clipping, diodes, median filters, neural networks, and human perception are all nonlinear. Recognizing nonlinearity prevents invalid superposition arguments.' },
    ],
    takeaways: [
      'Linearity = homogeneity + additivity, valid over the system’s operating range.',
      'Linear systems preserve sinusoidal frequency; nonlinear systems create new frequencies.',
      'Superposition turns impulse, sinusoidal, and step decompositions into practical analysis methods.',
      'A linear time-invariant system is completely characterized by its impulse response.',
      'Nonlinear methods are appropriate when the physics or noise statistics demand them.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'Which system is linear?',
        options: ['$y[n]=x[n]+1$', '$y[n]=3x[n]$', '$y[n]=x[n]^2$', '$y[n]=|x[n]|$'],
        answer: 1,
        explanation: 'Multiplication by a constant satisfies both scaling and additivity. The others introduce offsets, powers, or absolute values that break superposition.',
        wrongHints: { 0: 'The +1 offset breaks homogeneity and additivity.', 2: 'Squaring is nonlinear: (x₁+x₂)² ≠ x₁²+x₂².', 3: 'Absolute value is nonlinear: |x₁+x₂| ≠ |x₁|+|x₂| in general.' },
      },
      {
        type: 'mcq', question: 'A sinusoid passes through a nonlinear system. Which statement is true?',
        options: ['The output is always a sinusoid of the same frequency.', 'The output may contain harmonics and intermodulation products.', 'The output must be zero.', 'The output frequency always doubles.'],
        answer: 1,
        explanation: 'Nonlinearities generate new frequencies. A pure sine may produce harmonics at 2f, 3f, …; two input tones can produce sum and difference frequencies.',
        wrongHints: { 0: 'That is sinusoidal fidelity, a property of linear systems only.', 2: 'A zero output requires a zero input (or a broken system), not merely nonlinearity.', 3: 'Doubling is only one possible harmonic; the output can contain many frequencies.' },
      },
      {
        type: 'tf', question: 'If two linear systems are cascaded, their order can be swapped without changing the overall input–output relationship.',
        options: ['True', 'False'], answer: 0,
        explanation: 'Linear time-invariant systems commute in cascade: the overall impulse response is the convolution of the two, and convolution is commutative.',
      },
    ],
  },

  {
    number: 6,
    title: 'Convolution',
    part: 'Fundamentals',
    tagline: 'The operation that turns an impulse response into a complete system description.',
    intro: `Convolution is how a linear system combines its past and present inputs, weighted by its impulse response. It is both a mathematical operation and a way of thinking: every input sample launches a scaled copy of the impulse response, and the output is the sum of all those copies.

The chapter derives convolution from impulse decomposition, presents two equivalent algorithms (input-side and output-side), and interprets the result as a sum of weighted inputs. This is the most important computational pattern in DSP; filters, reverberation, image blur, and correlation are all close relatives.`,
    objectives: [
      'Express any signal as a sum of shifted impulses.',
      'Define the impulse response and convolution sum.',
      'Apply the input-side and output-side convolution algorithms.',
      'Predict output length and boundary behavior.',
      'Explain convolution as superposition of scaled impulse responses.',
    ],
    prerequisites: [5],
    sections: [
      {
        id: '6.1', title: 'The Delta Function and Impulse Response', page: 107, level: 'core',
        intuition: `A delta function is a single sample of height one at position zero. Its response reveals everything a linear system does to a sudden kick.`,
        detail: `The discrete delta is $\\delta[n]=1$ for $n=0$ and $0$ otherwise. Any signal can be written as a sum of scaled, shifted deltas: $x[n]=\\sum_k x[k]\\delta[n-k]$. The impulse response $h[n]$ is the system's output when the input is $\\delta[n]$. For a linear time-invariant (LTI) system, the response to $\\delta[n-k]$ is $h[n-k]$, and the response to $x[k]\\delta[n-k]$ is $x[k]h[n-k]$. Superposition then gives the convolution sum. The impulse response is a complete fingerprint of an LTI system—no other information is needed to predict its output for any input, assuming zero initial state.`,
        formulas: [
          { label: 'Discrete delta', tex: '\\delta[n]=\\begin{cases}1,&n=0\\\\0,&n\\ne0\\end{cases}', vars: 'Unit impulse' },
          { label: 'Impulse decomposition', tex: 'x[n]=\\sum_{k=-\\infty}^{\\infty} x[k]\\,\\delta[n-k]', vars: 'Every sample is a scaled delta' },
        ],
        keyPoints: [
          'The delta is the identity element for convolution.',
          'The impulse response characterizes a linear time-invariant system.',
          'Time invariance means a shifted impulse produces a shifted response.',
        ],
        caveat: `The impulse response alone does not describe a system with nonzero initial conditions or a time-varying system.`,
      },
      {
        id: '6.2', title: 'Convolution', page: 108, level: 'core',
        intuition: `Convolution slides the impulse response across the input, scales it by each input sample, and adds the overlapping copies.`,
        detail: `The convolution of $x[n]$ and $h[n]$ is $y[n]=(x*h)[n]=\\sum_{k=-\\infty}^{\\infty}x[k]h[n-k]$. For finite sequences of lengths $N$ and $M$, the output has length $N+M-1$. Convolution is commutative, associative, and distributive. The delta is the identity: $x*\\delta=x$. A shifted delta delays the signal: $x[n]*\\delta[n-s]=x[n-s]$. Graphically, one sequence is reversed, shifted by $n$, multiplied point-by-point with the other, and summed. The “flip and slide” picture is useful, but the input-side interpretation—each input sample launches a scaled copy of $h$—is often more intuitive for signals.`,
        formulas: [
          { label: 'Convolution sum', tex: 'y[n]=\\sum_{k=-\\infty}^{\\infty} x[k]\\,h[n-k]', vars: 'x = input, h = impulse response' },
          { label: 'Commutativity', tex: 'x*h = h*x', vars: 'Order does not matter' },
          { label: 'Output length', tex: 'L_y=N+M-1', vars: 'N, M = lengths of finite sequences' },
        ],
        keyPoints: [
          'Convolution combines an input with a system’s impulse response.',
          'Finite sequences of lengths N and M produce N+M−1 output samples.',
          'The operation is commutative, associative, and distributive.',
        ],
      },
      {
        id: '6.3', title: 'The Input Side Algorithm', page: 112, level: 'core',
        intuition: `Walk through the input one sample at a time. Each sample prints a scaled copy of the impulse response into the output, starting at that sample's position.`,
        detail: `For every input sample $x[k]$, add $x[k]h[n]$ shifted to start at $k$: $y[k+i]\\mathrel{+}=x[k]h[i]$ for each impulse-response index $i$. This is the most direct expression of superposition and is efficient when the input is short and the impulse response is long. In pseudocode: initialize the output to zero; loop over input samples; loop over impulse-response samples; accumulate into the output at the appropriate offset. Boundary handling is explicit: the output array must extend to $N+M-1$, and contributions outside it are discarded. The book contrasts this with the output-side algorithm, which computes one output sample at a time.`,
        formulas: [
          { label: 'Input-side accumulation', tex: 'y[k+i] \\mathrel{+}= x[k]\\,h[i]', vars: 'For every k and i' },
        ],
        keyPoints: [
          'Each input sample contributes a scaled, shifted impulse response.',
          'Natural when the input is shorter than the impulse response.',
          'Output must be long enough to hold all shifted copies.',
        ],
        application: `Room reverberation can be modeled as many echoes—each an input-side contribution with a different delay and gain.`,
      },
      {
        id: '6.4', title: 'The Output Side Algorithm', page: 116, level: 'core',
        intuition: `Walk through the output one sample at a time. For each output, gather the input samples that overlap the reversed impulse response and form a weighted sum.`,
        detail: `The output-side algorithm computes $y[n]=\\sum_i h[i]x[n-i]$ directly. For each output index $n$, multiply the impulse response by the input window ending at $n$, and sum. This is efficient when the impulse response is short—as in most FIR filters—because the inner loop length is fixed by the filter, not by the signal length. It also maps naturally to real-time processing: at each new sample, shift in one input value, compute one output value, and shift out the oldest. The book notes that the two algorithms produce identical results but have different computational costs and memory access patterns.`,
        formulas: [
          { label: 'Output-side form', tex: 'y[n]=\\sum_{i=0}^{M-1} h[i]\\,x[n-i]', vars: 'M = impulse-response length' },
        ],
        keyPoints: [
          'Computes one output at a time from a window of inputs.',
          'Natural for real-time FIR filtering and short kernels.',
          'Cost per output is proportional to the impulse-response length.',
        ],
        application: `Every real-time FIR filter, from audio equalizers to anti-alias filters, uses the output-side form.`,
      },
      {
        id: '6.5', title: 'The Sum of Weighted Inputs', page: 122, level: 'core',
        intuition: `Convolution is not just a formula. It says the output is a weighted sum of delayed copies of the input—or equivalently, a weighted sum of delayed impulse responses.`,
        detail: `The book emphasizes the conceptual meaning: convolution describes how each input sample influences a range of output samples. A delta impulse response passes a signal unchanged; a scaled delta amplifies it; a shifted delta delays it; a delta plus an echo creates reverberation; a rectangular pulse averages neighboring samples; a sinc kernel performs an ideal low-pass filter. The same operation can be viewed from the input side (contributions) or the output side (weighted sums). This dual view is essential for filter design: choose an impulse response that produces the desired weighting, then implement it by convolution.`,
        keyPoints: [
          'Convolution = weighted sum of shifted input copies = weighted sum of shifted impulse responses.',
          'The impulse response’s shape determines the system’s effect.',
          'Echo, smoothing, differentiation, and band-limiting are all convolution kernels.',
        ],
        application: `Audio reverb, image blur, edge detection, and channel equalization are all designed by choosing a kernel and convolving.`,
      },
    ],
    labs: [{
      id: 'convolution',
      title: 'Convolution, step by step',
      intro: 'Choose an input signal and an impulse response, then scrub through the convolution one output sample at a time. See the flipped kernel, the overlapping products, and the running sum.',
      tasks: [
        'Convolve a short pulse with a three-point averaging kernel. Predict the output length before checking.',
        'Use a delta kernel. Confirm that the output equals the input exactly.',
        'Try an echo kernel (delta plus a delayed, scaled delta). Listen to or inspect how the echo appears.',
      ],
    }],
    worked: {
      title: 'Convolve two short sequences by hand',
      problem: 'Let $x=[1,2,3]$ and $h=[1,-1]$. Compute $y=x*h$ using both the input-side and output-side views.',
      steps: [
        { title: 'Determine the output length', text: '$N=3$, $M=2$, so $L=3+2-1=4$: $y[0]$ through $y[3]$.' },
        { title: 'Input-side contributions', text: 'Input 1 launches $[1,-1]$ at index 0; input 2 launches $[2,-2]$ at index 1; input 3 launches $[3,-3]$ at index 2.' },
        { title: 'Add the shifted copies', text: '$y[0]=1$, $y[1]=-1+2=1$, $y[2]=-2+3=1$, $y[3]=-3$.' },
        { title: 'Check with the output-side formula', text: '$y[n]=\\sum_i h[i]x[n-i]$. For $n=1$: $h[0]x[1]+h[1]x[0]=2-1=1$. The results agree.' },
      ],
      answer: '$y=[1,1,1,-3]$. The first difference of the input is $[1,1,1]$, followed by the trailing −3 from the boundary; convolution with $[1,-1]$ computes a first difference and extends the result.',
    },
    misconceptions: [
      { wrong: 'Convolution is just multiplication of two signals.', right: 'Convolution combines a signal with a kernel through flipping, shifting, multiplying, and summing. Multiplication in time corresponds to convolution in frequency, not time.' },
      { wrong: 'The output of convolution has the same length as the input.', right: 'For finite sequences of lengths N and M, the full convolution has N+M−1 samples. “Same” output requires cropping or a different boundary convention.' },
      { wrong: 'The impulse response only matters for impulses.', right: 'For a linear time-invariant system, the impulse response determines the response to *every* input through convolution.' },
    ],
    takeaways: [
      'Any signal is a sum of scaled, shifted impulses; an LTI system is fully described by its impulse response.',
      'Convolution is superposition applied sample by sample.',
      'Input-side and output-side algorithms are equivalent; choose based on which sequence is shorter.',
      'Full convolution of lengths N and M has N+M−1 samples.',
      'Kernel shape determines the operation: smoothing, delay, echo, differentiation, or band-limiting.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'What is the length of the full convolution of a 20-sample signal with a 5-sample kernel?',
        options: ['20', '24', '25', '100'],
        answer: 1,
        explanation: 'Full convolution length is N+M−1 = 20+5−1 = 24.',
        wrongHints: { 0: 'The output is longer than the input for a multi-sample kernel.', 2: 'That would be N+M; the first output is at index 0, so subtract one.', 3: '100 is N×M, not the output length.' },
      },
      {
        type: 'mcq', question: 'Convolving a signal with $\\delta[n-4]$ produces:',
        options: ['The signal scaled by 4', 'The signal delayed by 4 samples', 'The signal advanced by 4 samples', 'The signal squared'],
        answer: 1,
        explanation: '$x[n]*\\delta[n-4]=x[n-4]$, a delay of four samples.',
        wrongHints: { 0: 'A scaled delta would multiply the signal by a constant; the shift controls timing.', 2: 'A negative shift would advance the signal.', 3: 'Squaring is a nonlinear pointwise operation, not convolution.' },
      },
      {
        type: 'tf', question: 'In the output-side convolution algorithm, each output sample is computed from a window of input samples weighted by the impulse response.',
        options: ['True', 'False'], answer: 0,
        explanation: 'The output-side form y[n]=Σ h[i]x[n−i] computes one output at a time from a sliding window of inputs.',
      },
    ],
  },

  {
    number: 7,
    title: 'Properties of Convolution',
    part: 'Fundamentals',
    tagline: 'A toolkit of kernels, algebraic rules, correlation, and the cost of computation.',
    intro: `Once convolution is understood as a system description, a small set of kernels explains a surprising range of operations: identity, gain, delay, echo, differentiation, integration, smoothing, and ideal band-limiting. The algebra of convolution then lets us combine systems, and correlation gives us a tool for finding patterns and delays.

The chapter also confronts the practical problem: direct convolution is expensive when both signals are long. That cost motivates the FFT and the fast convolution methods developed later.`,
    objectives: [
      'Recognize common impulse responses and their effects.',
      'Apply the commutative, associative, and distributive properties.',
      'Distinguish convolution from correlation and use each appropriately.',
      'Estimate the computational cost of direct convolution.',
    ],
    prerequisites: [6],
    sections: [
      {
        id: '7.1', title: 'Common Impulse Responses', page: 123, level: 'core',
        intuition: `A handful of kernels covers most everyday processing: a spike passes, a spike with an echo reverberates, a box smooths, a ramp integrates, and a sinc band-limits.`,
        detail: `The book catalogs common impulse responses. A delta is the identity. A scaled delta provides gain or attenuation. A shifted delta delays or advances. A delta plus a delayed, scaled delta creates an echo. A first difference kernel $[1,-1]$ approximates differentiation; a running sum implements discrete integration. An exponential decay is a simple low-pass filter, a rectangular pulse is a moving average, and a sinc is the ideal low-pass kernel. A high-pass kernel can be formed by subtracting a low-pass kernel from a delta. Because convolution is linear, these kernels can be combined: cascading a smoothing filter and a differencing filter gives a smoothed derivative.`,
        formulas: [
          { label: 'First difference', tex: 'y[n]=x[n]-x[n-1]', vars: 'Kernel [1, −1]' },
          { label: 'Running sum', tex: 'y[n]=x[n]+y[n-1]', vars: 'Recursive discrete integration' },
          { label: 'Echo', tex: 'h[n]=\\delta[n]+a\\,\\delta[n-s]', vars: 'a = echo gain, s = delay in samples' },
        ],
        keyPoints: [
          'Delta = identity; scaled delta = gain; shifted delta = delay.',
          'Box and exponential kernels smooth; difference kernels sharpen.',
          'Sinc is the ideal low-pass kernel but is infinitely long and noncausal.',
        ],
        application: `Audio delay/echo effects, image unsharp masking (delta minus blur), and edge detection (first difference).`,
      },
      {
        id: '7.2', title: 'Mathematical Properties', page: 132, level: 'core',
        intuition: `Convolution behaves like multiplication in algebra: it commutes, associates, and distributes. Those rules let you collapse block diagrams.`,
        detail: `Convolution is commutative ($x*h=h*x$), associative ($(x*h_1)*h_2=x*(h_1*h_2)$), and distributive over addition ($x*(h_1+h_2)=x*h_1+x*h_2$). The delta is the identity. Cascading two systems convolves their impulse responses; placing them in parallel adds their impulse responses. A shift in either signal shifts the output. The convolution theorem states that convolution in the time domain equals multiplication in the frequency domain (and vice versa), which is the basis of FFT convolution. Convolution with a delta reproduces the signal; convolution with a step integrates it. These properties are exact for LTI systems and are the grammar of block-diagram algebra.`,
        formulas: [
          { label: 'Associativity', tex: '(x*h_1)*h_2 = x*(h_1*h_2)', vars: 'Cascade = convolution of kernels' },
          { label: 'Distributivity', tex: 'x*(h_1+h_2)=x*h_1+x*h_2', vars: 'Parallel = sum of kernels' },
          { label: 'Convolution theorem', tex: 'x[n]*h[n] \\;\\longleftrightarrow\\; X[k]\\,H[k]', vars: 'DFT domain multiplication' },
        ],
        keyPoints: [
          'Cascade → convolve impulse responses; parallel → add them.',
          'Convolution in time = multiplication in frequency.',
          'The algebra is exact for linear time-invariant systems.',
        ],
        caveat: `Associativity assumes exact arithmetic and zero initial conditions. In fixed-point hardware, reordering can change overflow and round-off behavior.`,
      },
      {
        id: '7.3', title: 'Correlation', page: 136, level: 'core',
        intuition: `Correlation measures how much one signal looks like a shifted copy of another. It is the tool behind radar, sonar, pattern matching, and delay estimation.`,
        detail: `Cross-correlation is $r_{xy}[l]=\\sum_n x[n]\\,y[n-l]$ (with a convention for the lag sign). It slides one signal past the other and measures similarity at each lag. Unlike convolution, correlation does not reverse the kernel; it compares waveforms directly. Auto-correlation correlates a signal with itself; its peak at lag zero measures energy, and secondary peaks reveal periodicity. Normalized correlation ranges from −1 to +1. In radar and sonar, correlating the received echo with the transmitted pulse (matched filtering) maximizes the peak relative to noise and estimates the delay. Correlation is not generally commutative: $r_{xy}[l]=r_{yx}[-l]$.`,
        formulas: [
          { label: 'Cross-correlation', tex: 'r_{xy}[l]=\\sum_{n} x[n]\\,y[n-l]', vars: 'l = lag in samples' },
          { label: 'Normalized correlation', tex: '\\rho_{xy}[l]=\\frac{r_{xy}[l]}{\\sqrt{r_{xx}[0]\\,r_{yy}[0]}}', vars: 'Range approximately −1 to +1' },
        ],
        keyPoints: [
          'Correlation measures similarity versus lag; convolution describes a system response.',
          'Matched filtering = correlation with a known pulse.',
          'Auto-correlation reveals periodicity and energy.',
        ],
        caveat: `A high correlation does not prove causation or even a direct relationship; it only measures linear similarity at a lag.`,
        application: `GPS receivers correlate received codes with local replicas; radar uses matched filtering to detect weak echoes; audio uses cross-correlation for delay estimation.`,
      },
      {
        id: '7.4', title: 'Speed', page: 140, level: 'core',
        intuition: `Direct convolution multiplies every input sample by every kernel sample. When both are long, that is a lot of arithmetic—hence the FFT.`,
        detail: `For an input of length $N$ and a kernel of length $M$, direct convolution requires about $NM$ multiply–accumulate operations. If $M$ is small, this is cheap and cache-friendly. If both are large, the $O(N\\log N)$ FFT method can be far faster, but it has overhead and requires zero padding to avoid circular wraparound. The crossover depends on the hardware, the FFT implementation, and the kernel length. The book also notes that FIR filters with symmetric coefficients can halve the multiplications, and that real-time systems must meet a per-sample deadline, not just minimize total operations. These considerations drive the design of Chapters 12 and 18.`,
        formulas: [
          { label: 'Direct convolution cost', tex: 'C_{\\mathrm{direct}} \\approx N M', vars: 'Multiply–accumulate operations' },
          { label: 'FFT convolution cost', tex: 'C_{\\mathrm{FFT}} \\approx 3\\,N\\log_2 N', vars: 'Two forward FFTs, one inverse, plus multiplies' },
        ],
        keyPoints: [
          'Direct convolution is O(NM); FFT convolution is O(N log N).',
          'FFT wins only when sequences are long enough to amortize overhead.',
          'Real-time deadlines and memory access can matter more than operation counts.',
        ],
        application: `Short audio EQ kernels use direct convolution; long reverb impulses and image blurs often use FFT convolution.`,
      },
    ],
    labs: [{
      id: 'convolution-properties',
      title: 'Kernels and correlation',
      intro: 'Compare identity, gain, delay, echo, smoothing, differencing, and sinc kernels on the same signal. Then switch to correlation mode and find a hidden delay.',
      tasks: [
        'Apply the first-difference kernel to a ramp. What should the output be?',
        'Cascade a moving average and a first difference. Compare with the convolution of the two kernels.',
        'Use correlation to estimate the delay of an echo. Does the peak move when you change the delay?',
      ],
    }],
    worked: {
      title: 'Collapse a cascade',
      problem: 'A signal passes through a 3-point moving average with kernel $h_1=[1/3,1/3,1/3]$, then a first-difference filter $h_2=[1,-1]$. Find the equivalent single kernel and its effect.',
      steps: [
        { title: 'Convolve the kernels', text: 'Compute $h=h_1*h_2$. Length is $3+2-1=4$.' },
        { title: 'Input-side contributions', text: '$h_1/3$ launches $[1,-1]$ at 0; $1/3$ at 1; $1/3$ at 2.' },
        { title: 'Sum', text: '$h=[1/3,\\ 0,\\ 0,\\ -1/3]$. The middle terms cancel.' },
        { title: 'Interpret', text: 'The cascade is a smoothed difference: $y[n]=(x[n]-x[n-3])/3$. It compares a sample with the one three samples earlier, divided by three.' },
      ],
      answer: 'The equivalent kernel is $[1/3,0,0,-1/3]$. Cascading filters convolves their kernels, and the two middle taps cancel, leaving a sparse difference over a three-sample lag.',
    },
    misconceptions: [
      { wrong: 'Correlation and convolution are the same operation.', right: 'Convolution reverses the kernel; correlation does not. Correlation measures similarity versus lag; convolution computes a system response.' },
      { wrong: 'Convolution with a running-sum kernel is always stable.', right: 'The running sum has an impulse response that never decays; its output can grow without bound for a constant input. Stability depends on the system, not just the name.' },
      { wrong: 'FFT convolution is always faster.', right: 'For short kernels, direct convolution avoids FFT overhead and is often faster. The crossover depends on N, M, and hardware.' },
    ],
    takeaways: [
      'Common kernels implement identity, gain, delay, echo, differentiation, integration, smoothing, and ideal low-pass filtering.',
      'Cascade = convolution; parallel = addition; these rules simplify block diagrams.',
      'Correlation measures similarity versus lag and underlies matched filtering.',
      'Direct convolution costs O(NM); FFT methods trade overhead for O(N log N).',
    ],
    quiz: [
      {
        type: 'mcq', question: 'What is the effect of convolving a signal with $[1,-1]$?',
        options: ['A running sum', 'A first difference (discrete derivative)', 'A low-pass filter', 'A four-sample delay'],
        answer: 1,
        explanation: '$y[n]=x[n]-x[n-1]$, the first difference. It emphasizes rapid changes and attenuates slow trends.',
        wrongHints: { 0: 'The running sum kernel is [1,1,1,…], not [1,−1].', 2: 'A low-pass kernel has positive adjacent taps; [1,−1] is high-pass.', 3: 'Delay requires a shifted delta, not a two-tap difference.' },
      },
      {
        type: 'mcq', question: 'Two systems with impulse responses h₁ and h₂ are connected in parallel. The equivalent impulse response is:',
        options: ['h₁*h₂', 'h₁+h₂', 'h₁−h₂ only', 'δ'],
        answer: 1,
        explanation: 'Parallel outputs add, so the equivalent impulse response is the sum h₁+h₂. Cascade would convolve them.',
        wrongHints: { 0: 'Convolution describes a cascade, not a parallel connection.', 2: 'Subtraction would require one path to be inverted.', 3: 'A delta would mean the system does nothing.' },
      },
      {
        type: 'tf', question: 'Cross-correlation is generally commutative.',
        options: ['True', 'False'], answer: 1,
        explanation: 'Reversing the roles of the signals reverses the lag: r_xy[l] = r_yx[−l]. So correlation is not generally commutative.',
      },
    ],
  },

  {
    number: 8,
    title: 'The Discrete Fourier Transform',
    part: 'Fundamentals',
    tagline: 'Decomposing a finite record into the frequencies that build it.',
    intro: `The discrete Fourier transform (DFT) answers a precise question: how much of each discrete frequency is present in a finite sequence of N samples? It rewrites the signal as a sum of sines and cosines whose frequencies are integer multiples of the fundamental $1/N$ cycles per sample.

This chapter builds the real DFT from its basis functions, develops both analysis (forward) and synthesis (inverse) equations, explains the frequency axis, duality, and polar notation, and warns about the practical nuisances of phase and scaling. The DFT is not an approximation in this context: a length-N signal is exactly represented by N/2+1 real frequency bins (plus the implicit conjugate half).`,
    objectives: [
      'Place the DFT among the four Fourier transforms.',
      'Write and interpret the real DFT analysis and synthesis equations.',
      'Map DFT bin index to frequency and identify the Nyquist bin.',
      'Explain basis functions, orthogonality, and duality.',
      'Convert between rectangular and polar representations and avoid phase pitfalls.',
    ],
    prerequisites: [5, 6],
    sections: [
      {
        id: '8.1', title: 'The Family of Fourier Transform', page: 141, level: 'core',
        intuition: `There are four Fourier transforms because signals can be continuous or discrete, and periodic or aperiodic. Each combination gives a different tool.`,
        detail: `The Fourier *transform* handles continuous, aperiodic signals. The Fourier *series* handles continuous, periodic signals. The discrete-time Fourier transform (DTFT) handles discrete, aperiodic signals and produces a continuous, periodic spectrum. The discrete Fourier transform (DFT) handles discrete, periodic (or finite-length) signals and produces a discrete, periodic spectrum. The book presents this family as a two-by-two table. The DFT is the workhorse of DSP because computers store finite arrays: it maps N time samples to N frequency samples, and both domains are periodic. The FFT is simply a fast algorithm for computing the DFT.`,
        formulas: [
          { label: 'DFT pair (complex form)', tex: 'X[k]=\\sum_{n=0}^{N-1}x[n]e^{-j2\\pi kn/N},\\qquad x[n]=\\frac{1}{N}\\sum_{k=0}^{N-1}X[k]e^{j2\\pi kn/N}', vars: 'N-point discrete Fourier transform' },
        ],
        keyPoints: [
          'Continuous vs. discrete and periodic vs. aperiodic produce four transform types.',
          'The DFT assumes both time and frequency are discrete and periodic.',
          'The FFT computes the same DFT faster; it is not a different transform.',
        ],
      },
      {
        id: '8.2', title: 'Notation and Format of the Real DFT', page: 146, level: 'core',
        intuition: `For a real signal, the spectrum is symmetric, so only half the bins are independent. The real DFT stores those N/2+1 bins as a real and an imaginary part.`,
        detail: `For an N-point real signal, the DFT has N/2+1 unique bins: $k=0,1,\\ldots,N/2$. Bin 0 is DC, and bin N/2 is the Nyquist frequency. The book writes $\\mathrm{Re}X[k]$ and $\\mathrm{Im}X[k]$ for the cosine and negative-sine components. The imaginary part is negative for a positive sine component because the analysis uses $e^{-j2\\pi kn/N}$. The real DFT is not a truncated complex DFT with an arbitrary convention: the one-sided spectrum is sufficient because bins above N/2 are complex conjugates of bins below. The endpoints (DC and Nyquist) have no imaginary part for a real signal.`,
        formulas: [
          { label: 'Real DFT bins', tex: 'k=0,1,\\ldots,N/2', vars: 'N/2+1 independent real frequencies' },
          { label: 'Frequency of bin k', tex: 'f_k=\\frac{k}{N}\\quad\\text{cycles/sample}', vars: 'DC at k=0; Nyquist at k=N/2' },
        ],
        keyPoints: [
          'A real N-point signal has N/2+1 unique DFT bins.',
          'Bin 0 = DC; bin N/2 = Nyquist.',
          'The imaginary sign encodes sine phase; the book uses a negative sine convention.',
        ],
        caveat: `The one-sided real DFT is a storage and interpretation convention. The underlying complex DFT still has N bins, with conjugate symmetry.`,
      },
      {
        id: '8.3', title: "The Frequency Domain's Independent Variable", page: 148, level: 'core',
        intuition: `DFT bin k corresponds to k cycles across the N-sample record. Divide by N and you have cycles per sample; multiply by the sampling rate and you have hertz.`,
        detail: `The DFT’s frequency axis runs from 0 to just under 1 cycle/sample in the complex case, or 0 to 0.5 cycles/sample in the one-sided real case. Bin spacing is $1/N$ cycles/sample, or $f_s/N$ hertz. Increasing N with $f_s$ fixed gives finer frequency resolution (smaller bin spacing) and a longer time record. Zero padding a signal before the DFT interpolates the spectrum but does not add information or improve true resolution. The DFT is periodic in frequency with period $f_s$ (or 1 cycle/sample); the one-sided display shows only the baseband copy.`,
        formulas: [
          { label: 'Bin frequency', tex: 'f_k = k\\frac{f_s}{N}', vars: 'f_s = sampling rate, N = DFT length' },
          { label: 'Resolution', tex: '\\Delta f = \\frac{f_s}{N} = \\frac{1}{T_{\\mathrm{record}}}', vars: 'T_record = N/f_s' },
        ],
        keyPoints: [
          'Bin k = k/N cycles per sample.',
          'Resolution is set by record length, not by zero padding.',
          'The DFT spectrum repeats every f_s.',
        ],
        application: `A 1-second record at 48 kHz has 1 Hz bin spacing; a 0.1-second record has 10 Hz spacing.`,
      },
      {
        id: '8.4', title: 'DFT Basis Functions', page: 150, level: 'core',
        intuition: `Each DFT bin is a pure cosine and sine pair. The transform measures how strongly the signal correlates with each pair.`,
        detail: `The basis functions are $\\cos(2\\pi kn/N)$ and $\\sin(2\\pi kn/N)$ for $k=0,\\ldots,N/2$. They are orthogonal over the N-sample window: the sum of the product of two different basis functions is zero, and the sum of a basis function squared is $N/2$ (or $N$ for DC). The DFT coefficients are therefore projections of the signal onto these axes. This correlation view explains why an integer number of cycles in the window produces a clean peak, and why a non-integer number produces leakage. The basis functions are not confined to the window in the underlying periodic extension; the DFT treats the N samples as one period of a periodic signal.`,
        formulas: [
          { label: 'Orthogonality', tex: '\\sum_{n=0}^{N-1}\\cos\\!\\left(\\frac{2\\pi k n}{N}\\right)\\cos\\!\\left(\\frac{2\\pi m n}{N}\\right)=0\\quad(k\\ne m)', vars: 'Basis functions are orthogonal' },
          { label: 'Basis energy', tex: '\\sum_{n=0}^{N-1}\\cos^2\\!\\left(\\frac{2\\pi k n}{N}\\right)=\\frac{N}{2}\\quad(k\\ne0,N/2)', vars: 'Half the energy in each sinusoid' },
        ],
        keyPoints: [
          'The DFT projects the signal onto cosine and sine basis functions.',
          'Orthogonality makes the coefficients independent.',
          'The basis is periodic over N samples, matching the DFT’s periodic assumption.',
        ],
      },
      {
        id: '8.5', title: 'Synthesis, Calculating the Inverse DFT', page: 152, level: 'core',
        intuition: `Synthesis rebuilds the time signal by adding up all the cosine and sine waves with the amplitudes the DFT found.`,
        detail: `The inverse real DFT is $x[n]=\\frac{1}{N}\\mathrm{Re}X[0]+\\frac{2}{N}\\sum_{k=1}^{N/2-1}\\left[\\mathrm{Re}X[k]\\cos\\frac{2\\pi kn}{N}-\\mathrm{Im}X[k]\\sin\\frac{2\\pi kn}{N}\\right]+\\frac{1}{N}\\mathrm{Re}X[N/2]\\cos(\\pi n)$. The factors of 2 account for the energy split between positive and negative frequencies; DC and Nyquist are counted once. The book’s synthesis equation uses the same sign convention as the analysis. Adding only some bins reconstructs a band-limited version of the signal; this is how low-pass filtering can be implemented in the frequency domain.`,
        formulas: [
          { label: 'Inverse real DFT', tex: 'x[n]=\\frac{1}{N}\\mathrm{Re}X[0]+\\frac{2}{N}\\sum_{k=1}^{N/2-1}\\left[\\mathrm{Re}X[k]\\cos\\frac{2\\pi kn}{N}-\\mathrm{Im}X[k]\\sin\\frac{2\\pi kn}{N}\\right]+\\frac{1}{N}\\mathrm{Re}X[N/2]\\cos(\\pi n)', vars: 'One-sided real synthesis' },
        ],
        keyPoints: [
          'Synthesis is a weighted sum of basis functions.',
          'DC and Nyquist bins are not doubled; interior bins are.',
          'Truncating the sum band-limits the reconstructed signal and creates Gibbs ringing at edges.',
        ],
      },
      {
        id: '8.6', title: 'Analysis, Calculating the DFT', page: 156, level: 'core',
        intuition: `Analysis asks each basis function: how much of you is in this signal? The answer is a correlation, scaled so the inverse transform works.`,
        detail: `The real DFT analysis equations are $\\mathrm{Re}X[k]=\\frac{2}{N}\\sum_{n=0}^{N-1}x[n]\\cos\\frac{2\\pi kn}{N}$ for interior bins and $\\mathrm{Re}X[0]=\\frac{1}{N}\\sum x[n]$, with analogous endpoint handling for Nyquist. The imaginary part is $\\mathrm{Im}X[k]=-\\frac{2}{N}\\sum x[n]\\sin\\frac{2\\pi kn}{N}$. The factor 2/N makes the inverse formulas consistent. For a sinusoid exactly on a bin, the magnitude is the sinusoid’s amplitude; for a signal with multiple components, each bin’s coefficient is the amplitude of that frequency component (with sign/phase information in the imaginary part).`,
        formulas: [
          { label: 'Real part', tex: '\\mathrm{Re}X[k]=\\frac{2}{N}\\sum_{n=0}^{N-1}x[n]\\cos\\!\\left(\\frac{2\\pi kn}{N}\\right)', vars: 'Interior bins 1…N/2−1' },
          { label: 'Imaginary part', tex: '\\mathrm{Im}X[k]=-\\frac{2}{N}\\sum_{n=0}^{N-1}x[n]\\sin\\!\\left(\\frac{2\\pi kn}{N}\\right)', vars: 'Negative sign follows e^{-j2πkn/N}' },
        ],
        keyPoints: [
          'Analysis is a normalized correlation with each basis function.',
          'The 2/N scale makes synthesis exact.',
          'A bin-centered sinusoid produces a clean pair of coefficients.',
        ],
        caveat: `Sign conventions differ between books and software. Always check whether the forward transform uses e^{−jωn} or e^{+jωn}.`,
      },
      {
        id: '8.7', title: 'Duality', page: 161, level: 'advanced',
        intuition: `Time and frequency are mirror images. A narrow pulse in time is broad in frequency; a narrow band in frequency is a long ringing in time.`,
        detail: `The Fourier transform is symmetric: the same mathematics applies in both directions, with sign and scaling adjustments. A delta in time has a flat spectrum; a constant in time has a delta spectrum. A rectangular pulse in time has a sinc spectrum; a sinc in time has a rectangular spectrum. Convolution in one domain corresponds to multiplication in the other. Duality turns a difficult time-domain question into an easier frequency-domain one, and explains why sharp edges and narrow filters necessarily ring. The DFT’s periodic and finite nature adds wraparound subtleties, but the symmetry remains.`,
        keyPoints: [
          'Time–frequency reciprocity: narrow in one domain → broad in the other.',
          'Convolution ↔ multiplication is the most useful duality.',
          'Sharp edges and abrupt truncation produce sinc-shaped spectra and ringing.',
        ],
      },
      {
        id: '8.8', title: 'Polar Notation', page: 161, level: 'core',
        intuition: `A frequency component has an amplitude and a phase. Polar notation packages the real and imaginary parts into those two intuitive quantities.`,
        detail: `For each bin, the magnitude is $M[k]=\\sqrt{\\mathrm{Re}X[k]^2+\\mathrm{Im}X[k]^2}$ and the phase is $\\phi[k]=\\atan2(\\mathrm{Im}X[k],\\mathrm{Re}X[k])$. Conversely, $\\mathrm{Re}X[k]=M[k]\\cos\\phi[k]$ and $\\mathrm{Im}X[k]=M[k]\\sin\\phi[k]$. A sinusoid $A\\cos(2\\pi kn/N+\\theta)$ has magnitude A and a phase related to θ. Polar form is natural for filters (magnitude and phase response) and for understanding time shifts: a delay multiplies each frequency by a linear phase ramp.`,
        formulas: [
          { label: 'Magnitude and phase', tex: 'M[k]=\\sqrt{\\mathrm{Re}X[k]^2+\\mathrm{Im}X[k]^2},\\qquad \\phi[k]=\\tan^{-1}\\!\\left(\\frac{\\mathrm{Im}X[k]}{\\mathrm{Re}X[k]}\\right)', vars: 'Use atan2 for the correct quadrant' },
          { label: 'Rectangular form', tex: '\\mathrm{Re}X[k]=M[k]\\cos\\phi[k],\\qquad \\mathrm{Im}X[k]=M[k]\\sin\\phi[k]', vars: 'Convert back for synthesis' },
        ],
        keyPoints: [
          'Magnitude = amplitude; phase = timing/offset of each sinusoid.',
          'Use atan2, not atan, to get the correct quadrant.',
          'A time delay produces a linear phase versus frequency.',
        ],
        application: `Bode plots show magnitude in dB and phase in degrees; filter specifications are often written in polar terms.`,
      },
      {
        id: '8.9', title: 'Polar Nuisances', page: 164, level: 'core',
        intuition: `Phase is slippery: it wraps every 360°, is undefined when amplitude is zero, and depends on sign conventions. Small amplitude noise can cause wild-looking phase.`,
        detail: `The book lists practical traps. Phase is only meaningful modulo $2\\pi$; plotting raw atan2 output produces jumps at ±180°. Unwrapping adds or subtracts multiples of $2\\pi$ to make the curve continuous, but the absolute phase still depends on the time reference. When magnitude is zero, phase is undefined; near zero, tiny noise can swing the phase wildly. A negative real coefficient corresponds to phase π, which may appear as a sign inversion rather than a delay. The DFT’s phase reference is sample 0, so shifting the window changes the phase ramp. For these reasons, magnitude spectra are often more robust than phase spectra, and phase should be interpreted with the underlying time shift in mind.`,
        keyPoints: [
          'Phase wraps modulo 2π; unwrap for display.',
          'Zero magnitude makes phase undefined.',
          'Changing the time origin adds a linear phase ramp.',
          'Sign conventions vary; document them.',
        ],
        caveat: `Do not average phase angles directly across bins or records; average the complex spectrum or use circular statistics.`,
      },
    ],
    labs: [{
      id: 'dft',
      title: 'Build a signal from DFT basis functions',
      intro: 'Add cosine and sine components at selected bins, then run the analysis to recover their amplitudes and phases. Inspect the basis functions and the exact reconstruction.',
      tasks: [
        'Create a signal with bins 3 and 7 only. Predict the spectrum, then verify it.',
        'Change the phase of one component. How do the real and imaginary parts change?',
        'Reconstruct with only the first few bins. Compare the result with the original and explain the difference.',
      ],
    }],
    worked: {
      title: 'Analyze an 8-point signal',
      problem: 'Let $x=[1,0,-1,0,1,0,-1,0]$ for $n=0,\\ldots,7$. Identify its dominant DFT bin and amplitude.',
      steps: [
        { title: 'Recognize the pattern', text: 'The sequence repeats every 4 samples: it is a cosine-like wave with two cycles over 8 samples.' },
        { title: 'Locate the bin', text: 'Two cycles per 8 samples means $k=2$. The period is $N/k=4$ samples.' },
        { title: 'Compute the coefficient', text: 'The signal equals $\\cos(2\\pi\\cdot2n/8)$, so the cosine amplitude is 1. In the book’s real DFT scaling, $\\mathrm{Re}X[2]=1$.' },
        { title: 'Check the other bins', text: 'The signal is orthogonal to all other basis functions over the 8-sample window, so their coefficients are zero (apart from numerical round-off).' },
      ],
      answer: 'The only nonzero interior bin is $k=2$, with real amplitude 1. The DFT pair represents two cycles per record, i.e., a frequency of $2/8=0.25$ cycles/sample.',
    },
    misconceptions: [
      { wrong: 'The DFT gives the frequencies present in an infinitely long signal.', right: 'The DFT analyzes a finite N-sample record, implicitly treated as one period of a periodic signal. Record length and windowing determine resolution and leakage.' },
      { wrong: 'Zero padding increases frequency resolution.', right: 'Zero padding interpolates the spectrum and makes the plot smoother, but the true resolution is set by the original observation time, 1/T.' },
      { wrong: 'Phase is just a minor detail; magnitude tells the whole story.', right: 'Phase determines waveform shape, delay, and the outcome of filtering. Two signals with identical magnitude spectra can look completely different.' },
    ],
    takeaways: [
      'The DFT maps N real samples to N/2+1 independent frequency bins.',
      'Analysis projects onto cosine/sine basis functions; synthesis adds them back.',
      'Bin k corresponds to k/N cycles per sample; resolution is f_s/N.',
      'Duality links narrow pulses to broad spectra and convolution to multiplication.',
      'Polar notation is intuitive but phase wrapping and reference choices require care.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'For a 1024-point DFT at a 48 kHz sampling rate, what is the frequency spacing between bins?',
        options: ['46.9 Hz', '48 Hz', '1024 Hz', '23.4 Hz'],
        answer: 0,
        explanation: '$\\Delta f=f_s/N=48000/1024=46.875$ Hz.',
        wrongHints: { 1: '48 Hz would be f_s/1000, not f_s/1024.', 2: '1024 Hz is the DFT length, not a frequency spacing.', 3: '23.4 Hz is half the correct spacing.' },
      },
      {
        type: 'mcq', question: 'A real 16-point signal has how many unique one-sided DFT bins?',
        options: ['16', '8', '9', '7'],
        answer: 2,
        explanation: 'Bins 0 through N/2 inclusive: 0,1,…,8, for 9 bins. Bins above 8 are conjugates.',
        wrongHints: { 0: 'The complex DFT has 16 bins, but a real signal has conjugate symmetry.', 1: 'N/2=8 is the Nyquist bin index; the count includes DC, so 9.', 3: 'This omits either DC or Nyquist.' },
      },
      {
        type: 'tf', question: 'A time delay of s samples multiplies the DFT by a linear phase term.',
        options: ['True', 'False'], answer: 0,
        explanation: 'Shifting x[n] by s multiplies X[k] by e^{−j2πks/N}, whose phase is linear in k. The magnitude is unchanged.',
      },
    ],
  },

  {
    number: 9,
    title: 'Applications of the DFT',
    part: 'Fundamentals',
    tagline: 'From spectrum measurements to system identification and fast convolution.',
    intro: `The DFT is not just a mathematical curiosity. It is the basis of spectrum analyzers, frequency-response measurements, and one of the fastest ways to convolve long signals. Each application comes with practical choices: window type, record length, averaging, scaling, and zero padding.

This chapter connects the transform to measurement. It explains spectral leakage and resolution, how to measure a system’s frequency response, and how multiplication in the frequency domain implements convolution in the time domain—provided circular wraparound is handled correctly.`,
    objectives: [
      'Interpret a measured spectrum and its scaling.',
      'Explain leakage, windows, and the resolution/averaging tradeoff.',
      'Measure a system’s frequency response from its impulse response or from sinusoids.',
      'Perform convolution via the DFT with correct zero padding.',
    ],
    prerequisites: [8],
    sections: [
      {
        id: '9.1', title: 'Spectral Analysis of Signals', page: 169, level: 'core',
        intuition: `A spectrum analyzer is a prism for signals: it separates a complicated waveform into the frequencies that compose it. The DFT is the prism, and the window is the aperture.`,
        detail: `To analyze a signal, select N samples, apply a window (often Hamming or Blackman), compute the DFT, and display magnitude versus frequency. The window tapers the record edges to reduce leakage—the smearing of energy into neighboring bins when a frequency does not fall exactly on a bin. Leakage is not a bug in the DFT; it is the Fourier transform of the rectangular truncation. Resolution is approximately $f_s/N$ for a rectangular window and somewhat worse for tapered windows. Averaging successive spectra reduces the variance of noise estimates. Amplitude calibration depends on the window and whether the signal is a sinusoid or broadband noise; the book gives scaling rules.`,
        formulas: [
          { label: 'Frequency resolution', tex: '\\Delta f \\approx \\frac{f_s}{N}', vars: 'Rectangular window; tapered windows broaden the main lobe' },
          { label: 'Windowed DFT', tex: 'X_w[k]=\\sum_{n=0}^{N-1} w[n]x[n]e^{-j2\\pi kn/N}', vars: 'w[n] = window function' },
        ],
        keyPoints: [
          'Windowing trades main-lobe width for sidelobe leakage.',
          'Resolution is set by record length; zero padding only interpolates.',
          'Averaging reduces noise variance but not leakage bias.',
        ],
        caveat: `A window reduces leakage but also attenuates the signal and broadens peaks. Correct amplitude scaling depends on the window and signal type.`,
        application: `Vibration monitoring, audio spectrum displays, radio spectrum analyzers, and EEG band-power analysis.`,
      },
      {
        id: '9.2', title: 'Frequency Response of Systems', page: 177, level: 'core',
        intuition: `Tap a system with an impulse, transform the response, and you have its frequency response. Alternatively, sweep a sinusoid and measure amplitude and phase at each frequency.`,
        detail: `For a linear time-invariant system, the DFT of the impulse response is the frequency response $H[k]$. This is often the easiest measurement: drive the system with a pulse (or a known broadband signal), record the output, and divide the output spectrum by the input spectrum. The result gives magnitude and phase versus frequency. Practical issues include noise, finite record length, and the need to average or use a pseudo-random test signal with enough energy at all frequencies. The same information can be obtained by stepping a sinusoid through frequency, but that is slower. The frequency response is the most complete linear description for steady-state sinusoidal behavior.`,
        formulas: [
          { label: 'Frequency response from impulse response', tex: 'H[k]=\\mathrm{DFT}\\{h[n]\\}', vars: 'LTI system, zero initial state' },
          { label: 'Input–output spectra', tex: 'Y[k]=H[k]\\,X[k]', vars: 'For a linear system in steady state' },
        ],
        keyPoints: [
          'The DFT of the impulse response is the frequency response.',
          'Measurement requires broadband excitation or a frequency sweep.',
          'Noise can be reduced by averaging or using a longer coded test signal.',
        ],
        application: `Loudspeaker and room measurements, filter characterization, and control-system identification.`,
      },
      {
        id: '9.3', title: 'Convolution via the Frequency Domain', page: 180, level: 'core',
        intuition: `Convolution in time becomes multiplication in frequency. Transform both signals, multiply bin by bin, and transform back. It is fast—if you avoid circular wraparound.`,
        detail: `The DFT implements *circular* convolution: the output wraps around the N-point record. To obtain the linear convolution of lengths N and M, zero-pad both sequences to at least $N+M-1$ before the DFT. Then $y=\\mathrm{IDFT}\\{X\\cdot H\\}$ equals the linear convolution. The FFT makes this $O(N\\log N)$ instead of $O(NM)$. The book shows the procedure and discusses the overhead of forward/inverse transforms. For long signals, block methods (overlap-add or overlap-save) are used, as described in Chapter 18.`,
        formulas: [
          { label: 'Linear convolution via DFT', tex: 'y[n]=\\mathrm{IDFT}\\{X[k]H[k]\\}', vars: 'Zero-pad to at least N+M−1' },
          { label: 'Minimum DFT length', tex: 'L \\ge N+M-1', vars: 'Avoids circular wraparound' },
        ],
        keyPoints: [
          'DFT multiplication implements circular convolution.',
          'Zero padding to N+M−1 converts it to linear convolution.',
          'FFT convolution is faster for long sequences but has overhead.',
        ],
        caveat: `If you forget the zero padding, the tail of the convolution wraps around and corrupts the beginning of the output—a subtle but serious error.`,
      },
    ],
    labs: [{
      id: 'spectrum',
      title: 'Windows, leakage, and convolution',
      intro: 'Analyze a two-tone signal with different windows and record lengths. Watch a bin-centered tone stay sharp while an off-bin tone leaks. Then convolve two signals via the DFT with and without zero padding.',
      tasks: [
        'Set the tone exactly on a DFT bin. How much leakage do you see?',
        'Move it halfway between bins. Compare rectangular, Hamming, and Blackman windows.',
        'Turn zero padding off in the convolution demo and find the wraparound error.',
      ],
    }],
    worked: {
      title: 'Resolution or just interpolation?',
      problem: 'You record 0.1 s of a 1 kHz tone at 8 kHz and zero-pad the 800 samples to 8192 before the DFT. A colleague claims the 0.98 Hz bin spacing proves the analyzer can resolve two tones 1 Hz apart. Is that correct?',
      steps: [
        { title: 'Compute the original record length', text: '$N=800$ samples at 8 kHz, so $T=0.1$ s. The unpadded bin spacing is $8000/800=10$ Hz.' },
        { title: 'Compute the padded spacing', text: 'Zero padding to 8192 gives $8000/8192\\approx0.98$ Hz between displayed points.' },
        { title: 'Separate interpolation from resolution', text: 'Zero padding interpolates the underlying spectrum; it does not add observation time or information. The main-lobe width remains about 1/T = 10 Hz.' },
        { title: 'Conclude', text: 'Two tones 1 Hz apart would still merge. To resolve them, observe longer (increase T), not just pad more zeros.' },
      ],
      answer: 'The claim is false. The displayed grid is finer, but true resolution is still about 10 Hz. Record length sets resolution; zero padding only smooths the display.',
    },
    misconceptions: [
      { wrong: 'A longer FFT always gives better frequency resolution.', right: 'Resolution depends on the observation time. A longer FFT with zero padding only interpolates; a longer *record* improves resolution.' },
      { wrong: 'Windowing removes leakage completely.', right: 'Windows reduce sidelobes at the cost of a wider main lobe. Leakage is managed, not eliminated.' },
      { wrong: 'You can multiply DFTs directly without zero padding.', right: 'That computes circular convolution. Zero-pad to at least N+M−1 to get linear convolution.' },
    ],
    takeaways: [
      'Spectral analysis requires choices of window, record length, and averaging.',
      'Resolution ≈ f_s/N; zero padding interpolates but does not create resolution.',
      'A system’s frequency response is the DFT of its impulse response (or Y/X for broadband excitation).',
      'DFT multiplication is circular convolution unless you zero-pad.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'Why does an off-bin sinusoid leak energy into neighboring DFT bins?',
        options: ['Because the DFT is broken', 'Because truncating to N samples multiplies the signal by a rectangle, whose spectrum is a sinc', 'Because of floating-point error', 'Because the signal is nonlinear'],
        answer: 1,
        explanation: 'The finite record is the signal multiplied by a rectangular window. In frequency, that convolves the true spectrum with a sinc, spreading a tone that is not exactly on a bin.',
        wrongHints: { 0: 'Leakage is a consequence of finite observation, not an implementation bug.', 2: 'Leakage occurs in exact arithmetic too.', 3: 'Linearity is assumed; leakage is a windowing effect.' },
      },
      {
        type: 'mcq', question: 'To compute the linear convolution of lengths 100 and 30 via the DFT, what is the minimum transform length?',
        options: ['100', '128', '130', '256'],
        answer: 2,
        explanation: 'N+M−1 = 100+30−1 = 129, so the transform must be at least 129 points. A power of two (256) is often used for FFT efficiency, but 130 is the minimum if arbitrary lengths are supported.',
        wrongHints: { 0: '100 is only the input length; the output is longer.', 1: '128 is one sample short of 129 and would wrap.', 3: '256 is convenient but not the minimum.' },
      },
      {
        type: 'tf', question: 'The DFT of a system’s impulse response gives its frequency response.',
        options: ['True', 'False'], answer: 0,
        explanation: 'For a linear time-invariant system, the frequency response is the Fourier transform of the impulse response. The DFT gives samples of it.',
      },
    ],
  },

  {
    number: 10,
    title: 'Fourier Transform Properties',
    part: 'Fundamentals',
    tagline: 'The rules that let you reason about spectra without recomputing them.',
    intro: `Fourier analysis becomes powerful when you know how operations in one domain appear in the other. A time shift becomes a phase ramp; convolution becomes multiplication; multiplication becomes convolution; scaling stretches or compresses the spectrum. These rules let you predict the effect of a filter, a window, a modulation, or a sampling-rate change.

This chapter covers linearity, phase, periodicity, compression/expansion, amplitude modulation, the discrete-time Fourier transform, and Parseval’s relation. Together they form the grammar of frequency-domain reasoning.`,
    objectives: [
      'Apply linearity, shift, scaling, convolution, and multiplication rules.',
      'Interpret phase and group delay, including linear phase.',
      'Explain the DFT’s periodic extension and circular convolution.',
      'Relate decimation/interpolation to spectral scaling.',
      'Use Parseval’s relation to check energy calculations.',
    ],
    prerequisites: [8, 9],
    sections: [
      {
        id: '10.1', title: 'Linearity of the Fourier Transform', page: 185, level: 'core',
        intuition: `The Fourier transform is linear: the spectrum of a sum is the sum of the spectra, and scaling a signal scales its spectrum.`,
        detail: `If $x[n]\\leftrightarrow X[k]$ and $y[n]\\leftrightarrow Y[k]$, then $a x[n]+b y[n]\\leftrightarrow aX[k]+bY[k]$. This follows directly from the sum in the DFT. It means spectra of components add, which is why a mixture of tones produces separate peaks (before windowing smears them). It also means that filtering a sum is the same as filtering each component and summing—the frequency-domain version of superposition. Linearity is exact for the DFT, but windowing is a multiplication in time and therefore a convolution in frequency, so the *measured* spectrum of a sum is the sum of the windowed spectra, not necessarily the sum of ideal line spectra.`,
        formulas: [
          { label: 'Linearity', tex: 'a x[n]+b y[n] \\;\\longleftrightarrow\\; aX[k]+bY[k]', vars: 'DFT pair' },
        ],
        keyPoints: [
          'Spectra add linearly.',
          'Filtering can be applied per component.',
          'Windowed spectra are smeared, but the smearing is also linear.',
        ],
      },
      {
        id: '10.2', title: 'Characteristics of the Phase', page: 188, level: 'core',
        intuition: `Magnitude tells you which frequencies are present; phase tells you when each one occurs. A linear phase ramp is a pure time delay.`,
        detail: `A time shift $x[n-s]\\leftrightarrow X[k]e^{-j2\\pi ks/N}$ leaves the magnitude unchanged and adds a phase $-2\\pi ks/N$, which is linear in frequency. Linear phase is therefore equivalent to a constant delay for all frequencies—no dispersion. A nonlinear phase distorts the waveform even if the magnitude response is flat, because different frequencies are delayed by different amounts. Group delay, $-d\\phi/d\\omega$, measures the delay of a narrow band around a frequency. The book emphasizes that phase is often more important than magnitude for pulse-like signals and images. Phase wrapping and reference-time choices make phase plots tricky, but the underlying delay interpretation is robust.`,
        formulas: [
          { label: 'Time shift', tex: 'x[n-s]\\;\\longleftrightarrow\\;X[k]e^{-j2\\pi ks/N}', vars: 'Linear phase ramp' },
          { label: 'Group delay', tex: '\\tau_g(\\omega)=-\\frac{d\\phi(\\omega)}{d\\omega}', vars: 'Delay of a narrowband signal' },
        ],
        keyPoints: [
          'Linear phase ↔ constant delay ↔ no phase distortion.',
          'Nonlinear phase disperses a pulse even with flat magnitude.',
          'Group delay is the local slope of the phase curve.',
        ],
        application: `Linear-phase FIR filters preserve pulse shape; minimum-phase IIR filters have lower latency but distort phase.`,
      },
      {
        id: '10.3', title: 'Periodic Nature of the DFT', page: 194, level: 'core',
        intuition: `The DFT treats your N samples as one period of a signal that repeats forever. That assumption is why circular convolution and spectral wraparound exist.`,
        detail: `The DFT is periodic in both domains: $X[k+N]=X[k]$ and $x[n+N]=x[n]$. The time-domain periodicity is an assumption, not a property of the original analog signal. It means that filtering with the DFT is circular: samples that leave the right edge re-enter at the left. To approximate linear convolution, zero-pad to at least $N+M-1$. Sampling in one domain implies periodicity in the other: discrete time → periodic frequency; discrete frequency → periodic time. The book uses this to explain aliasing and the spectral copies produced by sampling. Periodicity also explains why the DFT has no “negative frequencies” in the one-sided real view—they are the same bins wrapped around.`,
        keyPoints: [
          'DFT time and frequency axes are both periodic with period N.',
          'Circular convolution wraps energy from the end to the beginning.',
          'Zero padding is the standard cure for wraparound in linear convolution.',
        ],
        caveat: `The periodic assumption can create artificial discontinuities at the record boundary, which appear as spectral leakage. Windowing reduces this artifact.`,
      },
      {
        id: '10.4', title: 'Compression and Expansion, Multirate methods', page: 200, level: 'core',
        intuition: `Squeeze a signal in time and its spectrum spreads out; stretch it and the spectrum compresses. Changing the sampling rate is a form of time scaling.`,
        detail: `If $y[n]=x[an]$ (decimation by an integer factor), the spectrum stretches and repeats; unless the signal is first low-pass filtered, aliasing occurs. If zeros are inserted between samples (interpolation), the spectrum compresses and images appear; a low-pass filter removes them. The book presents these as time-frequency scaling rules. Zero padding in time is different from interpolation: it adds no new information and simply samples the same continuous spectrum more finely. Multirate systems combine decimation, interpolation, and filtering to change sample rates efficiently, often using polyphase structures.`,
        formulas: [
          { label: 'Decimation', tex: 'y[n]=x[Mn]', vars: 'Keep every M-th sample; low-pass first' },
          { label: 'Interpolation', tex: 'y[Mn]=x[n],\\quad y[\\text{other}]=0', vars: 'Zero-stuffing; low-pass after' },
        ],
        keyPoints: [
          'Time compression → spectral expansion; time expansion → spectral compression.',
          'Decimation requires an anti-alias filter; interpolation requires an anti-image filter.',
          'Zero padding ≠ interpolation; it only interpolates the spectrum.',
        ],
        application: `Sample-rate conversion in audio, image resizing, and software-defined radio.`,
      },
      {
        id: '10.5', title: 'Multiplying Signals (Amplitude Modulation)', page: 204, level: 'core',
        intuition: `Multiply two signals in time and their spectra convolve. Multiply by a sinusoid and you shift the whole spectrum up and down—the basis of radio.`,
        detail: `Multiplication in time corresponds to convolution in frequency: $x[n]y[n]\\leftrightarrow X[k]*Y[k]$ (with scaling). If $y[n]=\\cos(2\\pi f_c n)$, its spectrum is two deltas at $\\pm f_c$, so the product contains copies of $X$ centered at $+f_c$ and $-f_c$. This is amplitude modulation: the message spectrum is translated to a carrier frequency. The same mechanism explains windowing (multiplying by a window convolves the spectrum with the window’s transform) and heterodyning (mixing to shift a band). In discrete time, the shifted copies may alias if they exceed Nyquist, which is why bandpass sampling requires care.`,
        formulas: [
          { label: 'Multiplication ↔ convolution', tex: 'x[n]\\,y[n] \\;\\longleftrightarrow\\; X[k]*Y[k]', vars: 'With appropriate 1/N scaling' },
          { label: 'AM with a carrier', tex: 'x[n]\\cos(2\\pi f_c n) \\;\\longleftrightarrow\\; \\tfrac12 X(f-f_c)+\\tfrac12 X(f+f_c)', vars: 'Copies of the message spectrum' },
        ],
        keyPoints: [
          'Time multiplication = frequency convolution.',
          'Multiplying by a sinusoid translates the spectrum to the carrier.',
          'Windowing is multiplication by a finite aperture, causing spectral smearing.',
        ],
        application: `AM radio, quadrature modulation, lock-in amplification, and spectral shifting.`,
      },
      {
        id: '10.6', title: 'The Discrete Time Fourier Transform', page: 206, level: 'advanced',
        intuition: `The DTFT is the spectrum of a discrete signal that never ends. It is a continuous, periodic function of frequency—the bridge between the DFT and the analog world.`,
        detail: `The DTFT is $X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}$, with inverse $x[n]=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}X(e^{j\\omega})e^{j\\omega n}d\\omega$. It is periodic in $\\omega$ with period $2\\pi$ because discrete time samples are spaced. The DFT is a sampled version of the DTFT: evaluating the DTFT at $\\omega=2\\pi k/N$ gives the N-point DFT of one period. The DTFT is useful for analyzing infinite or windowed sequences without committing to a finite DFT length, and for deriving sampling and multirate relationships.`,
        formulas: [
          { label: 'DTFT', tex: 'X(e^{j\\omega})=\\sum_{n=-\\infty}^{\\infty}x[n]e^{-j\\omega n}', vars: 'ω = rad/sample; periodic with 2π' },
          { label: 'Inverse DTFT', tex: 'x[n]=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}X(e^{j\\omega})e^{j\\omega n}\\,d\\omega', vars: 'One period of the spectrum' },
        ],
        keyPoints: [
          'DTFT: discrete time, continuous and periodic frequency.',
          'The DFT samples the DTFT at N equally spaced frequencies.',
          'Periodicity in frequency is a consequence of discrete time.',
        ],
      },
      {
        id: '10.7', title: "Parseval's Relation", page: 208, level: 'core',
        intuition: `Energy is conserved when you change domains. The total energy in the time signal equals the total energy in its spectrum (with the right scaling).`,
        detail: `For the DFT, $\\sum_{n=0}^{N-1}|x[n]|^2=\\frac{1}{N}\\sum_{k=0}^{N-1}|X[k]|^2$. For the one-sided real DFT, the interior bins must be counted twice or scaled appropriately. Parseval’s relation is a powerful consistency check: if a transform implementation or scaling convention is wrong, energy will not match. It also justifies frequency-domain filtering and compression: removing low-energy bins removes little signal energy. For random signals, the analogous quantity is power spectral density.`,
        formulas: [
          { label: 'Parseval (DFT)', tex: '\\sum_{n=0}^{N-1}|x[n]|^2=\\frac{1}{N}\\sum_{k=0}^{N-1}|X[k]|^2', vars: 'Total energy is preserved' },
        ],
        keyPoints: [
          'Time-domain energy equals scaled frequency-domain energy.',
          'Parseval is a unit test for transform scaling.',
          'Discarding small spectral bins discards little energy.',
        ],
        application: `Validating FFT code, estimating signal power in bands, and setting compression thresholds.`,
      },
    ],
    labs: [{
      id: 'fourier-properties',
      title: 'Shift, scale, modulate, and check Parseval',
      intro: 'Apply time shifts, time scaling, and multiplication by a carrier to a test signal. Compare the measured spectra with the predicted rules and verify energy conservation.',
      tasks: [
        'Delay the signal by a few samples. Confirm that the magnitude is unchanged and the phase becomes linear.',
        'Multiply by a cosine at 0.2 cycles/sample. Identify the two spectral copies.',
        'Compute time and frequency energy with the displayed scaling. Do they agree?',
      ],
    }],
    worked: {
      title: 'Predict the spectrum of a modulated tone',
      problem: 'A 100 Hz tone is multiplied by a 1 kHz carrier. The sampling rate is 8 kHz. What frequencies appear in the spectrum, and are they properly represented?',
      steps: [
        { title: 'Write the product', text: '$\\cos(2\\pi100t)\\cos(2\\pi1000t)=\\tfrac12\\cos(2\\pi900t)+\\tfrac12\\cos(2\\pi1100t)$.' },
        { title: 'Identify the sidebands', text: 'The spectrum contains components at 900 Hz and 1100 Hz, each with half the original amplitude.' },
        { title: 'Check Nyquist', text: 'The sampling rate is 8 kHz, so Nyquist is 4 kHz. Both sidebands are well below it.' },
        { title: 'Confirm with the modulation rule', text: 'Multiplication by the 1 kHz carrier shifts the 100 Hz message spectrum to ±1 kHz, producing 900 Hz and 1100 Hz.' },
      ],
      answer: 'The output contains 900 Hz and 1100 Hz sidebands, each at half amplitude. No aliasing occurs at 8 kHz sampling.',
    },
    misconceptions: [
      { wrong: 'A time shift changes the magnitude spectrum.', right: 'A pure delay only changes phase. Magnitude is unchanged because the same frequencies are present with the same amplitudes.' },
      { wrong: 'Multiplying two signals adds their spectra.', right: 'Multiplication in time corresponds to convolution in frequency. Addition in time would add spectra.' },
      { wrong: 'The DFT’s periodic assumption has no practical consequences.', right: 'It causes circular convolution and boundary wraparound. Zero padding and windowing are standard mitigations.' },
    ],
    takeaways: [
      'Fourier operations follow predictable rules: linearity, shift/phase, scaling, convolution/multiplication.',
      'Linear phase means constant delay; nonlinear phase disperses waveforms.',
      'The DFT is periodic in both domains, causing circular effects.',
      'Multiplying by a sinusoid translates the spectrum—the basis of modulation.',
      'Parseval’s relation checks energy and transform scaling.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'Delaying a signal by 3 samples has what effect on its DFT magnitude?',
        options: ['It triples the magnitude', 'It leaves the magnitude unchanged', 'It zeroes every third bin', 'It reverses the spectrum'],
        answer: 1,
        explanation: 'A delay multiplies the spectrum by e^{−j2πk·3/N}, which has unit magnitude. Only the phase changes.',
        wrongHints: { 0: 'Delay does not amplify; gain would.', 2: 'A delay does not selectively remove bins.', 3: 'Time reversal, not delay, reverses the spectrum.' },
      },
      {
        type: 'mcq', question: 'Multiplying a signal by a cosine wave produces:',
        options: ['A sum of the original spectrum and the cosine spectrum', 'Two shifted copies of the original spectrum', 'A time-reversed spectrum', 'No change in the spectrum'],
        answer: 1,
        explanation: 'Multiplication in time is convolution in frequency. A cosine has two delta components, so the spectrum is copied to ±f_c.',
        wrongHints: { 0: 'That would be addition in time, not multiplication.', 2: 'Time reversal flips the spectrum; modulation shifts it.', 3: 'Modulation necessarily changes the spectrum.' },
      },
      {
        type: 'tf', question: 'Parseval’s relation can be used to check whether an FFT implementation and its scaling are correct.',
        options: ['True', 'False'], answer: 0,
        explanation: 'If time-domain energy and the appropriately scaled frequency-domain energy disagree, the transform or scaling is wrong.',
      },
    ],
  },

  {
    number: 11,
    title: 'Fourier Transform Pairs',
    part: 'Fundamentals',
    tagline: 'The small dictionary of shapes that explains spectra, ringing, harmonics, and chirps.',
    intro: `A few transform pairs cover most of DSP intuition. A delta is flat; a rectangle is a sinc; a triangle is a sinc squared; a Gaussian is a Gaussian. These pairs explain why sharp edges ring, why windows trade resolution for leakage, and why a short pulse occupies a wide band.

The chapter also introduces the Gibbs effect, harmonics, and chirp signals. Together these concepts connect the abstract transform to real waveforms: edges, periodic distortion, and frequency sweeps used in radar and sonar.`,
    objectives: [
      'Recall and apply the delta, rectangle/sinc, triangle, and Gaussian pairs.',
      'Explain width reciprocity and the Gibbs overshoot.',
      'Interpret harmonics of periodic signals and distortion symmetry.',
      'Describe a chirp and its use in pulse compression.',
    ],
    prerequisites: [8, 10],
    sections: [
      {
        id: '11.1', title: 'Delta Function Pairs', page: 209, level: 'core',
        intuition: `A delta contains all frequencies equally; a constant contains only DC. These two extremes anchor the transform dictionary.`,
        detail: `In discrete time, $\\delta[n]\\leftrightarrow 1$: an impulse has a flat spectrum. A constant $1\\leftrightarrow N\\delta[k]$ in the DFT (with the book’s scaling), or a delta at DC in the DTFT. A shifted delta adds a linear phase. An impulse train in time transforms to an impulse train in frequency, which is the mathematical basis of sampling and aliasing. The book uses these pairs to explain why a very short pulse spreads energy across the spectrum and why a pure DC signal has a single spectral line.`,
        formulas: [
          { label: 'Delta pair', tex: '\\delta[n] \\;\\longleftrightarrow\\; 1', vars: 'Flat spectrum' },
          { label: 'Constant pair (DFT)', tex: '1 \\;\\longleftrightarrow\\; N\\,\\delta[k]', vars: 'Energy only at DC' },
        ],
        keyPoints: [
          'Delta in time = all frequencies, equal amplitude.',
          'Constant in time = DC only.',
          'Impulse trains transform to impulse trains, explaining sampling replicas.',
        ],
      },
      {
        id: '11.2', title: 'The Sinc Function', page: 212, level: 'core',
        intuition: `A rectangular pulse in time has a sinc spectrum. Make the pulse narrower and the sinc gets wider—the time–frequency seesaw.`,
        detail: `The sinc function is $\\mathrm{sinc}(x)=\\sin(\\pi x)/(\\pi x)$, with $\\mathrm{sinc}(0)=1$ and zeros at nonzero integers. A rectangle of width $M$ samples has a DFT magnitude proportional to $|\\sin(\\pi kM/N)/\\sin(\\pi k/N)|$, a periodic sinc. The first zero occurs where one full cycle fits across the pulse. A wider pulse gives a narrower main lobe; a narrower pulse gives a broader spectrum. The ideal low-pass filter has a rectangular frequency response, whose inverse transform is a sinc impulse response—infinitely long and noncausal. Truncating and windowing that sinc produces practical FIR filters (Chapter 16).`,
        formulas: [
          { label: 'Sinc', tex: '\\mathrm{sinc}(x)=\\frac{\\sin(\\pi x)}{\\pi x},\\qquad \\mathrm{sinc}(0)=1', vars: 'Zeros at nonzero integers' },
          { label: 'Ideal low-pass kernel', tex: 'h[i]=2f_c\\,\\mathrm{sinc}(2f_c i)', vars: 'f_c = cutoff as a fraction of f_s' },
        ],
        keyPoints: [
          'Rectangle ↔ sinc.',
          'Narrow pulse ↔ broad spectrum; broad pulse ↔ narrow spectrum.',
          'The ideal low-pass kernel is a sinc and must be truncated in practice.',
        ],
        caveat: `The sinc extends to infinity and decays slowly (1/|i|). Simple truncation causes significant ripple; a window is needed.`,
      },
      {
        id: '11.3', title: 'Other Transform Pairs', page: 215, level: 'core',
        intuition: `Triangles give sinc-squared spectra; Gaussians give Gaussians; a sine burst gives a Gaussian centered at the carrier. Each shape has a signature.`,
        detail: `A triangular pulse is the convolution of two rectangles, so its spectrum is the square of a sinc. A Gaussian is its own Fourier transform (with reciprocal width scaling), which makes it uniquely smooth in both domains. Multiplying a sine by a Gaussian produces a Gaussian burst whose spectrum is a Gaussian centered at the sine frequency—an amplitude-modulated packet. The book also discusses the discrete rectangle’s periodic sinc and the effects of aliasing. These pairs are building blocks: complicated spectra can often be understood as sums, products, or convolutions of these basic shapes.`,
        formulas: [
          { label: 'Triangle pair', tex: '\\mathrm{tri}(t) \\;\\longleftrightarrow\\; \\mathrm{sinc}^2(f)', vars: 'Convolution of two rectangles' },
          { label: 'Gaussian pair', tex: 'e^{-\\pi t^2} \\;\\longleftrightarrow\\; e^{-\\pi f^2}', vars: 'Self-dual under the transform' },
        ],
        keyPoints: [
          'Triangle ↔ sinc².',
          'Gaussian ↔ Gaussian; width reciprocity still holds.',
          'A windowed sine burst has a spectrum centered on the carrier.',
        ],
        application: `Gaussian windows in spectral analysis, triangular windows in FIR design, and wave packets in communications.`,
      },
      {
        id: '11.4', title: 'Gibbs Effect', page: 218, level: 'core',
        intuition: `Approximate a sharp edge with a finite number of sinusoids and you get overshoot and ringing near the edge. Adding more terms narrows the ringing but does not reduce its height.`,
        detail: `When a discontinuous signal is synthesized from a truncated Fourier series or DFT, the partial sum overshoots the edge by about 9% of the jump and oscillates. This is the Gibbs effect. As more harmonics are included, the oscillations move closer to the discontinuity and become narrower, but their amplitude remains about 9%. The series converges in energy, and exactly at the jump it converges to the midpoint. The same phenomenon appears when an ideal low-pass filter is truncated in time: the filter’s step response rings. Windowing the impulse response reduces the overshoot at the cost of a wider transition band.`,
        keyPoints: [
          'Gibbs overshoot is about 9% of a step for an ideal band-limited reconstruction.',
          'More harmonics narrow the ringing but do not remove the overshoot.',
          'Windowing trades stopband/ripple performance against transition width.',
        ],
        caveat: `The 9% figure applies to an ideal low-pass/rectangular truncation. Other windows and filter designs have different overshoot values.`,
        application: `Ringing in sharp image resizing, overshoot in FIR low-pass step responses, and visible halos around high-contrast edges.`,
      },
      {
        id: '11.5', title: 'Harmonics', page: 220, level: 'core',
        intuition: `A periodic signal is built from a fundamental and its integer multiples. The mix of harmonics determines the waveform’s shape and timbre.`,
        detail: `If a signal repeats with frequency $f_0$, its Fourier series contains only $f_0, 2f_0, 3f_0,\\ldots$. The fundamental is $f_0$; the second harmonic is $2f_0$, and so on. A pure sine has only the fundamental. A square wave has odd harmonics with amplitudes proportional to $1/n$. A sawtooth has all harmonics with amplitudes proportional to $1/n$. Symmetrical distortion (same shaping on positive and negative halves) produces odd harmonics; asymmetrical distortion produces even and odd harmonics. In discrete time, harmonics above Nyquist alias, so a nominally periodic waveform can acquire inharmonic components after sampling.`,
        formulas: [
          { label: 'Harmonic series', tex: 'x(t)=\\sum_{k=1}^{\\infty} a_k\\cos(2\\pi k f_0 t+\\phi_k)', vars: 'f₀ = fundamental; kf₀ = k-th harmonic' },
          { label: 'Square wave', tex: 'x(t)=\\frac{4}{\\pi}\\sum_{k\\ \\mathrm{odd}}\\frac{1}{k}\\sin(2\\pi k f_0 t)', vars: 'Odd harmonics only' },
        ],
        keyPoints: [
          'Periodic signals have discrete harmonic spectra.',
          'Waveform shape is determined by harmonic amplitudes and phases.',
          'Odd symmetry → odd harmonics; asymmetry → even harmonics too.',
        ],
        application: `Musical timbre, power-system harmonics, and distortion analysis.`,
      },
      {
        id: '11.6', title: 'Chirp Signals', page: 222, level: 'advanced',
        intuition: `A chirp sweeps its frequency over time—like a bird’s call or a radar pulse. Its spectrum is broad, but a matched filter can compress it into a sharp peak.`,
        detail: `A linear chirp has instantaneous frequency $f(t)=f_0+kt$. In radar and sonar, a long chirp transmits more energy than a short pulse while retaining fine delay resolution after matched filtering (pulse compression). The matched filter is the time-reversed complex conjugate of the transmitted chirp; its output peaks at the echo delay. The Wigner–Ville or spectrogram representation shows the frequency sweep as a diagonal line. The book uses chirps to illustrate that a signal can have a wide bandwidth even when its instantaneous frequency is well defined, and that time–frequency analysis is needed when the spectrum changes over time.`,
        formulas: [
          { label: 'Linear chirp', tex: 'x(t)=\\cos\\!\\left(2\\pi\\left(f_0 t+\\tfrac12 k t^2\\right)\\right)', vars: 'k = chirp rate (Hz/s)' },
          { label: 'Instantaneous frequency', tex: 'f_i(t)=f_0+k t', vars: 'Derivative of phase / 2π' },
        ],
        keyPoints: [
          'A chirp’s frequency changes with time, so a single spectrum hides its structure.',
          'Matched filtering compresses a long chirp into a narrow delay peak.',
          'Time–frequency displays (spectrograms) reveal chirp trajectories.',
        ],
        application: `Radar, sonar, ultrasound imaging, spread-spectrum communications, and seismic surveying.`,
      },
    ],
    labs: [{
      id: 'pairs',
      title: 'Shapes and their spectra',
      intro: 'Switch among delta, rectangle, triangle, Gaussian, and chirp signals. Adjust width and observe the reciprocal changes in the spectrum. Add harmonics to a square wave and watch Gibbs ringing shrink in width but not height.',
      tasks: [
        'Double the rectangle width. What happens to the first sinc zero?',
        'Increase the number of harmonics in the square-wave reconstruction. Measure the overshoot.',
        'Compare the spectrogram of a chirp with its ordinary spectrum. What information is lost in the spectrum?',
      ],
    }],
    worked: {
      title: 'Where is the first sinc zero?',
      problem: 'A rectangular pulse is 20 samples wide in a 128-point DFT. At which bin does the sinc spectrum first reach zero?',
      steps: [
        { title: 'Use the rectangle–sinc relationship', text: 'The first zero occurs when one full cycle of the DFT sinusoid fits across the pulse.' },
        { title: 'Set the condition', text: 'One cycle across M samples means the period is M, so the frequency is $1/M$ cycles/sample.' },
        { title: 'Convert to a bin', text: 'Bin $k$ has frequency $k/N$. Set $k/N=1/M$, so $k=N/M=128/20=6.4$.' },
        { title: 'Interpret', text: 'The first zero falls between bins 6 and 7; the discrete spectrum is sampled, so it may not land exactly on a zero.' },
      ],
      answer: 'The first zero is at $k=N/M=6.4$. A longer pulse (larger M) would move the zero to a lower bin, narrowing the main lobe.',
    },
    misconceptions: [
      { wrong: 'The Gibbs overshoot disappears if you use enough harmonics.', right: 'Its width shrinks, but its amplitude remains about 9% for an ideal band-limited step. Windowing is needed to reduce it.' },
      { wrong: 'A chirp has a single well-defined frequency.', right: 'Its instantaneous frequency changes with time. The ordinary spectrum shows the occupied band, not the trajectory.' },
      { wrong: 'A Gaussian and a rectangle have similar spectra because both are smooth pulses.', right: 'A Gaussian transforms to a Gaussian with no sidelobes; a rectangle transforms to a sinc with slowly decaying sidelobes.' },
    ],
    takeaways: [
      'Delta ↔ flat; rectangle ↔ sinc; triangle ↔ sinc²; Gaussian ↔ Gaussian.',
      'Time–frequency width is reciprocal.',
      'Gibbs ringing is about 9% for an ideal step and is narrowed, not removed, by more harmonics.',
      'Periodic signals have harmonic spectra; symmetry controls which harmonics appear.',
      'Chirps require time–frequency analysis and enable pulse compression.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'A rectangular pulse is made twice as wide. Its sinc spectrum’s main lobe becomes:',
        options: ['Twice as wide', 'Half as wide', 'The same width', 'Infinitely narrow'],
        answer: 1,
        explanation: 'Time and frequency widths are reciprocal. Doubling the pulse width halves the main-lobe width.',
        wrongHints: { 0: 'That would violate reciprocity; a wider pulse is more frequency-selective.', 2: 'Width scaling changes the spectrum unless the pulse is a delta or constant.', 3: 'A finite-width pulse always has a finite-width main lobe.' },
      },
      {
        type: 'mcq', question: 'The Gibbs overshoot for an ideal band-limited step is approximately:',
        options: ['1%', '9%', '50%', '100%'],
        answer: 1,
        explanation: 'The partial Fourier sum overshoots by about 9% of the step height, regardless of how many harmonics are included.',
        wrongHints: { 0: '1% is far too small for the ideal rectangular truncation.', 2: '50% would be halfway to the next level, which is not the Gibbs overshoot.', 3: 'A 100% overshoot would double the step, which does not occur.' },
      },
      {
        type: 'tf', question: 'A pure sine wave has only one harmonic: its fundamental.',
        options: ['True', 'False'], answer: 0,
        explanation: 'A pure sinusoid contains a single frequency. “Harmonics” usually refer to integer multiples above the fundamental; for a pure sine, only the fundamental is present.',
      },
    ],
  },

  {
    number: 12,
    title: 'The Fast Fourier Transform',
    part: 'Fundamentals',
    tagline: 'The algorithm that made spectral processing practical.',
    intro: `The DFT is conceptually simple but computationally expensive: N outputs, each summing N terms, for O(N²) work. The fast Fourier transform (FFT) computes exactly the same result in O(N log N) operations by recursively splitting the problem in half and reusing intermediate results.

This chapter explains how the FFT works, how real signals are handled, how programs are organized, and how speed and precision compare with the direct DFT. The FFT is arguably the most important algorithm in DSP; understanding its butterfly structure demystifies both its speed and its numerical behavior.`,
    objectives: [
      'Explain why the FFT is faster than the direct DFT without changing the result.',
      'Describe decimation-in-time, butterflies, and bit-reversal.',
      'Compute the operation count for an N-point radix-2 FFT.',
      'Handle real signals efficiently and understand scaling.',
      'Recognize precision and implementation tradeoffs.',
    ],
    prerequisites: [8, 10],
    sections: [
      {
        id: '12.1', title: 'Real DFT Using the Complex DFT', page: 225, level: 'core',
        intuition: `A real signal’s spectrum is symmetric, so half the complex DFT work is redundant. Clever packing and symmetry can cut the cost roughly in half.`,
        detail: `The complex DFT of N real samples produces N complex bins, but bins $k$ and $N-k$ are conjugates, so only N/2+1 are independent. A straightforward approach computes the N-point complex FFT and discards the redundant half. A more efficient real-FFT algorithm packs even and odd samples into the real and imaginary parts of an N/2-point complex sequence, computes that FFT, then separates the two spectra using symmetry. The book presents the real DFT in its N/2+1 format and discusses the relationship to the complex transform. In practice, high-quality libraries provide optimized real FFTs that avoid the wasted work.`,
        formulas: [
          { label: 'Conjugate symmetry', tex: 'X[N-k]=X^*[k]', vars: 'For real x[n]' },
          { label: 'Independent bins', tex: 'k=0,1,\\ldots,N/2', vars: 'N/2+1 real-DFT bins' },
        ],
        keyPoints: [
          'Real signals have conjugate-symmetric spectra.',
          'A real FFT can use an N/2-point complex FFT plus symmetry.',
          'Naively using a complex FFT for real data wastes about half the work.',
        ],
      },
      {
        id: '12.2', title: 'How the FFT works', page: 228, level: 'core',
        intuition: `Split the signal into even and odd samples, transform each half, then combine with twiddle factors. Repeat until the halves are one sample long.`,
        detail: `The radix-2 decimation-in-time FFT rewrites an N-point DFT as two N/2-point DFTs—one of the even-indexed samples, one of the odd—combined by twiddle factors $W_N^k=e^{-j2\\pi k/N}$. Each N/2-point DFT is split again, recursively, until the subproblems have length one. The combination step is a *butterfly*: two inputs produce two outputs using one complex multiply and two adds. There are $\\log_2 N$ stages, each with $N/2$ butterflies, giving $O(N\\log N)$ work. The recursive splitting permutes the input order; bit-reversal reorders the data so the butterflies can operate in place. The output is identical to the DFT (up to round-off).`,
        formulas: [
          { label: 'Twiddle factor', tex: 'W_N^k=e^{-j2\\pi k/N}', vars: 'Complex root of unity' },
          { label: 'Butterfly', tex: 'a^{\\prime}=a+W_N^k b,\\qquad b^{\\prime}=a-W_N^k b', vars: 'One complex multiply, two adds' },
          { label: 'Operation count', tex: '\\frac{N}{2}\\log_2 N\\ \\text{butterflies}', vars: 'Radix-2 FFT' },
        ],
        keyPoints: [
          'Split even/odd, recurse, combine with twiddles.',
          'Butterflies reuse intermediate results, avoiding redundant work.',
          'Bit-reversal restores natural order for in-place computation.',
        ],
        caveat: `The radix-2 FFT requires a power-of-two length. Other lengths use mixed-radix, Bluestein, or zero-padding.`,
      },
      {
        id: '12.3', title: 'FFT Programs', page: 233, level: 'support',
        intuition: `An FFT program is a loop over stages, with butterflies inside. The details are bookkeeping: indexing, twiddle tables, and scaling.`,
        detail: `The book presents a compact FFT program and explains its structure: bit-reversal permutation, nested loops over stages and butterflies, and twiddle factor updates. Implementations differ in whether they use recursion, in-place arrays, precomputed twiddle tables, or real-input specializations. Scaling conventions matter: some inverse FFTs divide by N, others require the caller to scale. Windowing is usually applied before the transform. For real signals, the imaginary array is zero on input, but the transform still produces a full complex spectrum that must be interpreted with conjugate symmetry. Modern libraries (FFTW, KissFFT, NumPy) hide these details but use the same mathematics.`,
        keyPoints: [
          'Bit-reversal + log₂N stages + butterflies = radix-2 FFT.',
          'Twiddle factors can be precomputed or updated recursively.',
          'Scaling conventions differ; verify forward/inverse normalization.',
        ],
      },
      {
        id: '12.4', title: 'Speed and Precision Comparisons', page: 237, level: 'core',
        intuition: `For N=1024, the FFT does tens of thousands of operations instead of about a million. The speedup grows with N, at a small cost in round-off.`,
        detail: `Direct DFT cost is about $N^2$ complex multiply–adds; radix-2 FFT cost is about $(N/2)\\log_2 N$ butterflies, each with one complex multiply. For N=1024, that is roughly 5,120 butterflies versus over a million direct terms—a speedup of hundreds. Floating-point FFT error grows slowly with N (roughly logarithmically in the number of stages), because each stage introduces rounding. Fixed-point FFTs require careful scaling to avoid overflow; block floating point is common. The FFT is numerically stable enough that double precision is rarely the limiting factor for moderate N. The book compares measured execution times and explains why the FFT dominates spectral processing.`,
        formulas: [
          { label: 'Direct DFT', tex: 'C_{\\mathrm{DFT}}=O(N^2)', vars: 'N outputs × N terms' },
          { label: 'Radix-2 FFT', tex: 'C_{\\mathrm{FFT}}=O(N\\log_2 N)', vars: 'Logarithmic number of stages' },
        ],
        keyPoints: [
          'FFT speedup grows with N; for large N it is enormous.',
          'Round-off error grows slowly with the number of stages.',
          'Fixed-point FFTs need scaling/block floating point to prevent overflow.',
        ],
        application: `Real-time spectrum analyzers, OFDM receivers, image compression, and fast convolution.`,
      },
      {
        id: '12.5', title: 'Further Speed Increases', page: 238, level: 'advanced',
        intuition: `Radix-2 is not the end. Radix-4, split-radix, real-input tricks, and pruning squeeze out more speed when every cycle counts.`,
        detail: `Radix-4 butterflies reduce the number of multiplications; split-radix algorithms reduce them further. Real FFTs exploit conjugate symmetry to halve the work. Pruning skips outputs or inputs known to be zero, useful in spectral analysis when only a band is needed. Mixed-radix algorithms handle non-power-of-two lengths efficiently. Hardware FFT engines use parallel butterflies and specialized memory. The book also notes that FFT convolution can replace direct convolution for long kernels, with overlap-add or overlap-save to handle streaming data. The asymptotic gain is fixed, but constant factors matter in embedded systems.`,
        keyPoints: [
          'Radix-4/split-radix reduce multiplication count.',
          'Real FFTs exploit symmetry; pruning skips unneeded bins.',
          'FFT convolution uses overlap methods for streaming signals.',
        ],
        application: `5G/OFDM basebands, radar pulse compression, and real-time video processing.`,
      },
    ],
    labs: [{
      id: 'fft',
      title: 'Inside the butterfly',
      intro: 'Step through an 8-point radix-2 FFT stage by stage. See the bit-reversed input, the twiddle factors, and how each butterfly combines two values. Compare the operation count with the direct DFT.',
      tasks: [
        'Step through the first stage. Which samples are paired?',
        'Verify that the final FFT magnitudes match the direct DFT.',
        'Increase N and compare the operation counts on the chart. At what N does the FFT win by 10×?',
      ],
    }],
    worked: {
      title: 'How much faster is the FFT?',
      problem: 'Compare the approximate number of complex multiplications for a direct 1024-point DFT and a radix-2 FFT.',
      steps: [
        { title: 'Direct DFT', text: 'Each of N outputs requires N complex products, so about $N^2=1024^2=1{,}048{,}576$ multiplications.' },
        { title: 'Radix-2 FFT', text: 'There are $(N/2)\\log_2 N=(512)(10)=5{,}120$ butterflies, each with one complex twiddle multiplication.' },
        { title: 'Compute the ratio', text: '$1{,}048{,}576/5{,}120\\approx205$. The FFT uses about 205 times fewer complex multiplications.' },
        { title: 'Account for overhead', text: 'Adds, indexing, and bit-reversal reduce the real-world speedup somewhat, but the asymptotic advantage is clear.' },
      ],
      answer: 'About 205× fewer complex multiplications for N=1024. The exact speedup depends on implementation and hardware, but the FFT is dramatically faster for large N.',
    },
    misconceptions: [
      { wrong: 'The FFT is an approximation to the DFT.', right: 'The FFT computes the exact same DFT (up to floating-point round-off). It is an algorithm, not a different transform.' },
      { wrong: 'The FFT only works for power-of-two lengths.', right: 'Radix-2 is the simplest case. Mixed-radix, Bluestein, and zero-padding handle other lengths.' },
      { wrong: 'A longer FFT always gives a better spectrum.', right: 'Resolution depends on record length. Zero padding changes the display grid, not the information.' },
    ],
    takeaways: [
      'The FFT computes the DFT in O(N log N) by reusing subproblems.',
      'Butterflies combine even/odd sub-DFTs with twiddle factors.',
      'Real signals have conjugate-symmetric spectra and can use specialized real FFTs.',
      'Round-off grows slowly; fixed-point implementations need scaling discipline.',
      'Radix-4, split-radix, pruning, and overlap methods extend the basic algorithm.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'How many stages does a radix-2 FFT of length 64 have?',
        options: ['4', '6', '32', '64'],
        answer: 1,
        explanation: '$\\log_2 64=6$ stages, each halving the subproblem size.',
        wrongHints: { 0: '4 stages would correspond to N=16.', 2: '32 is N/2, the number of butterflies per stage, not the number of stages.', 3: '64 is the sequence length, not the stage count.' },
      },
      {
        type: 'mcq', question: 'The main reason the FFT is faster than the direct DFT is that it:',
        options: ['uses fewer input samples', 'reuses intermediate results across subproblems', 'approximates the transform', 'ignores the phase'],
        answer: 1,
        explanation: 'The divide-and-conquer structure computes shared sub-DFTs once and combines them, eliminating redundant work.',
        wrongHints: { 0: 'The FFT uses all N samples; it does not discard data.', 2: 'The FFT is exact, not an approximation.', 3: 'Phase is fully preserved.' },
      },
      {
        type: 'tf', question: 'A real-valued signal’s DFT satisfies X[N−k] = X*[k].',
        options: ['True', 'False'], answer: 0,
        explanation: 'Conjugate symmetry follows from the real-valued time samples. It is why only N/2+1 bins are independent.',
      },
    ],
  },

  {
    number: 13,
    title: 'Continuous Signal Processing',
    part: 'Fundamentals',
    tagline: 'The analog counterparts of convolution and Fourier analysis.',
    intro: `DSP is built on continuous-time ideas. The continuous delta, convolution integral, Fourier transform, and Fourier series are the parents of their discrete counterparts. Understanding them clarifies why sampling works, what an impulse response means physically, and where discrete approximations diverge from analog reality.

This chapter is a bridge, not a detour. It presents the continuous delta and its sifting property, continuous convolution, the Fourier transform, and the Fourier series, with an eye to how each becomes a discrete algorithm.`,
    objectives: [
      'Define the continuous delta and use its sifting property.',
      'Compute continuous convolution for simple signals.',
      'Write the continuous Fourier transform and its inverse.',
      'Relate the Fourier series to periodic signals and harmonics.',
    ],
    prerequisites: [6, 8, 11],
    sections: [
      {
        id: '13.1', title: 'The Delta Function', page: 243, level: 'core',
        intuition: `The continuous delta is an infinitely narrow, infinitely tall spike with unit area. It is a mathematical idealization, not a physical waveform.`,
        detail: `The Dirac delta $\\delta(t)$ satisfies $\\delta(t)=0$ for $t\\ne0$ and $\\int_{-\\infty}^{\\infty}\\delta(t)\\,dt=1$. Its defining property is sifting: $\\int x(t)\\delta(t-t_0)\\,dt=x(t_0)$. It is the derivative of the unit step (in a distributional sense) and the identity for continuous convolution. Physical impulses have finite width and area; the delta is the limit as width goes to zero while area stays one. The book uses the delta to model sampling, impulse responses, and point sources. It also warns that multiplying or squaring deltas is not generally defined, and that engineers use the delta as a convenient limit rather than a function in the ordinary sense.`,
        formulas: [
          { label: 'Sifting property', tex: '\\int_{-\\infty}^{\\infty} x(t)\\,\\delta(t-t_0)\\,dt=x(t_0)', vars: 'Samples x at t₀' },
          { label: 'Unit area', tex: '\\int_{-\\infty}^{\\infty}\\delta(t)\\,dt=1', vars: 'Ideal impulse' },
        ],
        keyPoints: [
          'The delta has unit area and zero width—a limit, not a physical pulse.',
          'Sifting extracts a sample: ∫x(t)δ(t−t₀)dt=x(t₀).',
          'The delta is the identity for continuous convolution.',
        ],
        caveat: `The delta is a distribution. Expressions like δ(t)² or δ(t)/t require careful generalized-function definitions and are usually avoided.`,
      },
      {
        id: '13.2', title: 'Convolution', page: 246, level: 'core',
        intuition: `Continuous convolution is the same idea as discrete convolution: slide the impulse response across the input, scale, and integrate instead of sum.`,
        detail: `For continuous signals, $y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)h(t-\\tau)\\,d\\tau$. For a linear time-invariant system, $h(t)$ is the impulse response. Convolution is commutative, associative, and distributive, just as in discrete time. A continuous delta reproduces the signal; a shifted delta delays it; convolution with a rectangle smooths it. The discrete convolution sum is a sampled approximation of the integral, valid when the signals are band-limited and the sampling rate is adequate. Continuous convolution is used to model analog filters, room acoustics, and optical blur; discrete convolution approximates these when the sampling is fine enough.`,
        formulas: [
          { label: 'Continuous convolution', tex: 'y(t)=\\int_{-\\infty}^{\\infty}x(\\tau)\\,h(t-\\tau)\\,d\\tau', vars: 'h = impulse response' },
          { label: 'Delta identity', tex: 'x(t)*\\delta(t-t_0)=x(t-t_0)', vars: 'Shift by t₀' },
        ],
        keyPoints: [
          'Continuous convolution integrates; discrete convolution sums.',
          'The impulse response characterizes a continuous LTI system.',
          'Discrete convolution approximates the integral when sampling is adequate.',
        ],
      },
      {
        id: '13.3', title: 'The Fourier Transform', page: 252, level: 'core',
        intuition: `The continuous Fourier transform decomposes an aperiodic continuous signal into a continuum of frequencies. The inverse transform adds them back.`,
        detail: `The transform pair is $X(f)=\\int_{-\\infty}^{\\infty}x(t)e^{-j2\\pi ft}\\,dt$ and $x(t)=\\int_{-\\infty}^{\\infty}X(f)e^{j2\\pi ft}\\,df$. The spectrum is generally complex and extends over negative frequencies; for a real signal, $X(-f)=X^*(f)$. The transform is linear and follows the same shift, scaling, convolution, and modulation rules as the DFT, with integrals replacing sums. The continuous transform is the limit of the DTFT as the sampling interval goes to zero, and the DFT is a sampled, periodic approximation. It is the natural language for analog filters and for understanding what sampling does to a spectrum.`,
        formulas: [
          { label: 'Fourier transform', tex: 'X(f)=\\int_{-\\infty}^{\\infty}x(t)e^{-j2\\pi ft}\\,dt', vars: 'f in hertz' },
          { label: 'Inverse transform', tex: 'x(t)=\\int_{-\\infty}^{\\infty}X(f)e^{j2\\pi ft}\\,df', vars: 'Continuous superposition' },
        ],
        keyPoints: [
          'Continuous, aperiodic time ↔ continuous, aperiodic frequency.',
          'Real signals have conjugate-symmetric spectra.',
          'The same convolution/multiplication duality applies.',
        ],
        application: `Analog filter design, antenna patterns, optics, and the theoretical basis of sampling.`,
      },
      {
        id: '13.4', title: 'The Fourier Series', page: 255, level: 'core',
        intuition: `A periodic continuous signal is a sum of harmonics. The Fourier series gives the amplitude and phase of each harmonic.`,
        detail: `For a periodic signal with period $T$ and fundamental $f_0=1/T$, the Fourier series is $x(t)=\\sum_{k=-\\infty}^{\\infty}c_k e^{j2\\pi k f_0 t}$, with $c_k=\\frac{1}{T}\\int_0^T x(t)e^{-j2\\pi k f_0 t}\\,dt$. The coefficients are complex; for a real signal, $c_{-k}=c_k^*$. The series contains only integer multiples of $f_0$. A square wave has odd harmonics; a sawtooth has all harmonics. Truncating the series produces Gibbs ringing at discontinuities. The Fourier series is the periodic special case of the Fourier transform: a periodic signal has a line spectrum, represented by deltas in the transform domain.`,
        formulas: [
          { label: 'Fourier series', tex: 'x(t)=\\sum_{k=-\\infty}^{\\infty}c_k e^{j2\\pi k f_0 t}', vars: 'f₀ = 1/T' },
          { label: 'Coefficients', tex: 'c_k=\\frac{1}{T}\\int_{0}^{T}x(t)e^{-j2\\pi k f_0 t}\\,dt', vars: 'Complex amplitude of harmonic k' },
        ],
        keyPoints: [
          'Periodic signals have discrete harmonic spectra.',
          'The Fourier series is the periodic case of the Fourier transform.',
          'Truncation causes Gibbs ringing, just as in the DFT.',
        ],
        application: `Power-system waveform analysis, vibration signatures, and musical timbre.`,
      },
    ],
    labs: [{
      id: 'continuous',
      title: 'From continuous to discrete',
      intro: 'Compare a continuous signal, its samples, and its reconstructed approximation. Adjust sampling rate and interpolation method to see when the discrete model captures the continuous behavior.',
      tasks: [
        'Sample a smooth pulse well above Nyquist and compare continuous and discrete convolution.',
        'Lower the sampling rate until the reconstruction misses the pulse shape.',
        'Compare the continuous Fourier transform of a rectangle with the DFT of its samples.',
      ],
    }],
    worked: {
      title: 'Convolve a pulse with an exponential',
      problem: 'Let $x(t)=1$ for $0\\le t\\le1$ and 0 otherwise, and $h(t)=e^{-t}u(t)$. Compute $y(t)=x*h$ for $t\\ge0$.',
      steps: [
        { title: 'Write the integral', text: '$y(t)=\\int_0^1 h(t-\\tau)\\,d\\tau$ because x is 1 on [0,1].' },
        { title: 'Use the exponential response', text: '$h(t-\\tau)=e^{-(t-\\tau)}$ for $t\\ge\\tau$, else 0.' },
        { title: 'Split the range', text: 'For $0\\le t\\le1$: $y(t)=\\int_0^t e^{-(t-\\tau)}d\\tau=1-e^{-t}$. For $t>1$: $y(t)=\\int_0^1 e^{-(t-\\tau)}d\\tau=e^{-t}(e-1)$.' },
        { title: 'Check continuity', text: 'At $t=1$, both pieces give $1-e^{-1}\\approx0.632$. The output rises smoothly and decays exponentially after the pulse ends.' },
      ],
      answer: '$y(t)=1-e^{-t}$ for $0\\le t\\le1$, and $y(t)=(e-1)e^{-t}$ for $t>1$. This is the step response of the RC-like system, delayed and truncated by the finite pulse.',
    },
    misconceptions: [
      { wrong: 'The continuous delta is a real physical pulse with infinite amplitude.', right: 'It is an idealization defined by its area and sifting property. Physical pulses have finite width and amplitude.' },
      { wrong: 'Continuous convolution and discrete convolution always give identical numerical results.', right: 'Discrete convolution is exact for the sampled sequence, but it approximates the continuous integral only when sampling is adequate and the signals are band-limited.' },
      { wrong: 'The Fourier series applies only to sinusoids.', right: 'It represents any periodic signal (under mild conditions) as a sum of harmonically related sinusoids.' },
    ],
    takeaways: [
      'The continuous delta is defined by unit area and sifting, not by a finite height.',
      'Continuous convolution is an integral; discrete convolution is its sampled counterpart.',
      'The Fourier transform handles aperiodic continuous signals; the Fourier series handles periodic ones.',
      'Sampling links the continuous and discrete worlds, with band-limiting as the price of exact reconstruction.',
    ],
    quiz: [
      {
        type: 'mcq', question: 'What is $\\int_{-\\infty}^{\\infty}x(t)\\delta(t-2)\\,dt$?',
        options: ['x(0)', 'x(2)', '2x(0)', 'The area under x(t)'],
        answer: 1,
        explanation: 'The sifting property of the delta extracts the value of x at t=2.',
        wrongHints: { 0: 'That would be δ(t), not δ(t−2).', 2: 'The factor 2 is a time location, not an amplitude scale.', 3: 'That would be the integral of x without the delta.' },
      },
      {
        type: 'mcq', question: 'A periodic signal with fundamental 50 Hz has Fourier-series components at:',
        options: ['only 50 Hz', '50, 100, 150, … Hz', 'all frequencies', '0 Hz only'],
        answer: 1,
        explanation: 'A periodic signal has harmonics at integer multiples of the fundamental: 50, 100, 150 Hz, etc.',
        wrongHints: { 0: 'Only a pure sine has a single component; a general periodic signal has harmonics.', 2: 'A nonperiodic signal can have a continuous spectrum; periodicity restricts it to harmonics.', 3: 'DC may be present, but it is not the only component unless the signal is constant.' },
      },
      {
        type: 'tf', question: 'The continuous Fourier transform of a real signal satisfies X(−f)=X*(f).',
        options: ['True', 'False'], answer: 0,
        explanation: 'Conjugate symmetry is a consequence of the time signal being real-valued.',
      },
    ],
  },
];
