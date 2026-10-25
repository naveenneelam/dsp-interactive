# Concept Inventory

Source: Steven W. Smith, *The Scientist and Engineer's Guide to Digital Signal Processing*, 2nd ed. (California Technical Publishing, 1997–1999). The supplied 688-page PDF was audited page by page; 33 chapters and 185 sections were extracted from the heading structure.

- **Chapters:** 33
- **Sections:** 185
- **Authored explanations:** 185/185
- **Formulas:** 235
- **Practice questions:** 100
- **Interactive labs:** 33

## Chapter inventory

| Ch. | Title | Part | Book pages | PDF start | Sections | Lab | Quiz | Objectives |
|---:|---|---|---:|---:|---:|---|---:|---|
| 1 | The Breadth and Depth of DSP | Foundations | 1–10 | 15 | 5 | The signal chain, end to end | 3 | 4 |
| 2 | Statistics, Probability and Noise | Foundations | 11–34 | 25 | 7 | Noise, histograms, and the process behind the signal | 3 | 5 |
| 3 | ADC and DAC | Foundations | 35–66 | 73 | 7 | Sampling, aliasing, and quantization | 4 | 5 |
| 4 | DSP Software | Foundations | 67–86 | 105 | 7 | When arithmetic quietly drifts | 3 | 5 |
| 5 | Linear Systems | Fundamentals | 87–106 | 125 | 8 | Test a system for linearity | 3 | 5 |
| 6 | Convolution | Fundamentals | 107–122 | 145 | 5 | Convolution, step by step | 3 | 5 |
| 7 | Properties of Convolution | Fundamentals | 123–140 | 161 | 4 | Kernels and correlation | 3 | 4 |
| 8 | The Discrete Fourier Transform | Fundamentals | 141–168 | 179 | 9 | Build a signal from DFT basis functions | 3 | 5 |
| 9 | Applications of the DFT | Fundamentals | 169–184 | 207 | 3 | Windows, leakage, and convolution | 3 | 4 |
| 10 | Fourier Transform Properties | Fundamentals | 185–208 | 223 | 7 | Shift, scale, modulate, and check Parseval | 3 | 5 |
| 11 | Fourier Transform Pairs | Fundamentals | 209–224 | 247 | 6 | Shapes and their spectra | 3 | 4 |
| 12 | The Fast Fourier Transform | Fundamentals | 225–242 | 263 | 5 | Inside the butterfly | 3 | 5 |
| 13 | Continuous Signal Processing | Fundamentals | 243–260 | 281 | 4 | From continuous to discrete | 3 | 4 |
| 14 | Introduction to Digital Filters | Digital Filters | 261–276 | 299 | 6 | The filter design trade space | 3 | 5 |
| 15 | Moving Average Filters | Digital Filters | 277–284 | 315 | 5 | Noise versus edge sharpness | 3 | 4 |
| 16 | Windowed-Sinc Filters | Digital Filters | 285–296 | 323 | 4 | Design a windowed-sinc filter | 3 | 4 |
| 17 | Custom Filters | Digital Filters | 297–310 | 335 | 3 | Draw a response, get a filter | 3 | 4 |
| 18 | FFT Convolution | Digital Filters | 311–318 | 349 | 3 | Overlap-add, block by block | 3 | 4 |
| 19 | Recursive Filters | Digital Filters | 319–332 | 357 | 5 | Single-pole filters and stability | 3 | 5 |
| 20 | Chebyshev Filters | Digital Filters | 333–342 | 371 | 4 | Ripple, order, and overshoot | 3 | 4 |
| 21 | Filter Comparison | Digital Filters | 343–350 | 381 | 3 | Four filters, one specification | 3 | 4 |
| 22 | Audio Processing | Applications | 351–372 | 389 | 7 | Hearing, companding, and data rate | 3 | 5 |
| 23 | Image Formation & Display | Applications | 373–396 | 411 | 7 | Pixels, brightness, and warping | 3 | 5 |
| 24 | Linear Image Processing | Applications | 397–422 | 435 | 7 | Kernels, separability, and spectra | 3 | 5 |
| 25 | Special Imaging Techniques | Applications | 423–450 | 461 | 5 | Resolution, morphology, and CT | 3 | 5 |
| 26 | Neural Networks (and more!) | Applications | 451–480 | 489 | 6 | Train a perceptron | 3 | 5 |
| 27 | Data Compression | Applications | 481–502 | 519 | 7 | Compress text and images | 3 | 5 |
| 28 | Digital Signal Processors | Applications | 503–534 | 541 | 7 | Circular buffers and the MAC loop | 3 | 5 |
| 29 | Getting Started with DSPs | Applications | 535–550 | 573 | 6 | Size a real-time FIR audio filter | 3 | 5 |
| 30 | Complex Numbers | Complex Techniques | 551–566 | 589 | 6 | Rotate, multiply, and filter | 3 | 5 |
| 31 | The Complex Fourier Transform | Complex Techniques | 567–580 | 605 | 5 | The complex spectrum, including negative frequencies | 3 | 5 |
| 32 | The Laplace Transform | Complex Techniques | 581–604 | 619 | 5 | Poles, zeros, and the s-plane | 3 | 5 |
| 33 | The z-Transform | Complex Techniques | 605–630 | 643 | 7 | Poles, zeros, and digital stability | 3 | 5 |

## Section inventory

Each section id is stable and used by the app, the traceability matrix, quizzes, and the progress store.

| ID | Concept | Book p. | PDF p. | Level | Words | Formulas | Key points | Lab route | Status |
|---|---|---|---:|---:|---|---:|---:|---:|---|---|
| 1.1 | The Roots of DSP | 1 | 15 | core | 129 | 0 | 3 | The signal chain, end to end | Full |
| 1.2 | Telecommunications | 4 | 18 | support | 97 | 0 | 3 | Explanation-only | Explanation-only |
| 1.3 | Audio Processing | 5 | 19 | support | 113 | 0 | 3 | Explanation-only | Explanation-only |
| 1.4 | Echo Location | 7 | 21 | support | 113 | 1 | 3 | The signal chain, end to end | Full |
| 1.5 | Image Processing | 9 | 23 | support | 104 | 0 | 3 | Explanation-only | Explanation-only |
| 2.1 | Signal and Graph Terminology | 11 | 25 | core | 122 | 1 | 3 | Noise, histograms, and the process behind the signal | Full |
| 2.2 | Mean and Standard Deviation | 13 | 27 | core | 123 | 3 | 3 | Noise, histograms, and the process behind the signal | Full |
| 2.3 | Signal vs. Underlying Process | 17 | 31 | core | 126 | 0 | 3 | Noise, histograms, and the process behind the signal | Full |
| 2.4 | The Histogram, Pmf and Pdf | 19 | 33 | core | 120 | 2 | 3 | Noise, histograms, and the process behind the signal | Full |
| 2.5 | The Normal Distribution | 26 | 40 | core | 91 | 2 | 3 | Noise, histograms, and the process behind the signal | Full |
| 2.6 | Digital Noise Generation | 29 | 43 | core | 107 | 2 | 3 | Noise, histograms, and the process behind the signal | Full |
| 2.7 | Precision and Accuracy | 32 | 46 | core | 111 | 0 | 3 | Noise, histograms, and the process behind the signal | Full |
| 3.1 | Quantization | 35 | 73 | core | 136 | 3 | 3 | Sampling, aliasing, and quantization | Full |
| 3.2 | The Sampling Theorem | 39 | 77 | core | 155 | 3 | 3 | Sampling, aliasing, and quantization | Full |
| 3.3 | Digital-to-Analog Conversion | 44 | 82 | core | 122 | 1 | 3 | Sampling, aliasing, and quantization | Full |
| 3.4 | Analog Filters for Data Conversion | 48 | 86 | core | 126 | 0 | 3 | Sampling, aliasing, and quantization | Full |
| 3.5 | Selecting The Antialias Filter | 55 | 93 | core | 141 | 0 | 3 | Sampling, aliasing, and quantization | Full |
| 3.6 | Multirate Data Conversion | 58 | 96 | core | 126 | 1 | 3 | Sampling, aliasing, and quantization | Full |
| 3.7 | Single Bit Data Conversion | 60 | 98 | advanced | 118 | 0 | 3 | Explanation-only | Explanation-only |
| 4.1 | Computer Numbers | 67 | 105 | core | 117 | 0 | 3 | When arithmetic quietly drifts | Full |
| 4.2 | Fixed Point (Integers) | 68 | 106 | core | 125 | 2 | 3 | When arithmetic quietly drifts | Full |
| 4.3 | Floating Point (Real Numbers) | 70 | 108 | core | 125 | 2 | 3 | When arithmetic quietly drifts | Full |
| 4.4 | Number Precision | 72 | 110 | core | 136 | 2 | 3 | When arithmetic quietly drifts | Full |
| 4.5 | Execution Speed: Program Language | 76 | 114 | support | 119 | 0 | 3 | Explanation-only | Explanation-only |
| 4.6 | Execution Speed: Hardware | 80 | 118 | support | 106 | 0 | 3 | Explanation-only | Explanation-only |
| 4.7 | Execution Speed: Programming Tips | 85 | 123 | support | 118 | 0 | 3 | Explanation-only | Explanation-only |
| 5.1 | Signals and Systems | 87 | 125 | core | 129 | 1 | 3 | Test a system for linearity | Full |
| 5.2 | Requirements for Linearity | 89 | 127 | core | 109 | 3 | 3 | Test a system for linearity | Full |
| 5.3 | Static Linearity and Sinusoidal Fidelity | 92 | 130 | core | 118 | 2 | 3 | Test a system for linearity | Full |
| 5.4 | Examples of Linear and Nonlinear Systems | 94 | 132 | core | 148 | 0 | 3 | Test a system for linearity | Full |
| 5.5 | Special Properties of Linearity | 96 | 134 | core | 148 | 0 | 3 | Test a system for linearity | Full |
| 5.6 | Superposition: the Foundation of DSP | 98 | 136 | core | 129 | 0 | 3 | Test a system for linearity | Full |
| 5.7 | Common Decompositions | 100 | 138 | core | 127 | 2 | 3 | Test a system for linearity | Full |
| 5.8 | Alternatives to Linearity | 104 | 142 | advanced | 138 | 0 | 3 | Explanation-only | Explanation-only |
| 6.1 | The Delta Function and Impulse Response | 107 | 145 | core | 113 | 2 | 3 | Convolution, step by step | Full |
| 6.2 | Convolution | 108 | 146 | core | 98 | 3 | 3 | Convolution, step by step | Full |
| 6.3 | The Input Side Algorithm | 112 | 150 | core | 123 | 1 | 3 | Convolution, step by step | Full |
| 6.4 | The Output Side Algorithm | 116 | 154 | core | 123 | 1 | 3 | Convolution, step by step | Full |
| 6.5 | The Sum of Weighted Inputs | 122 | 160 | core | 124 | 0 | 3 | Convolution, step by step | Full |
| 7.1 | Common Impulse Responses | 123 | 161 | core | 132 | 3 | 3 | Kernels and correlation | Full |
| 7.2 | Mathematical Properties | 132 | 170 | core | 110 | 3 | 3 | Kernels and correlation | Full |
| 7.3 | Correlation | 136 | 174 | core | 116 | 2 | 3 | Kernels and correlation | Full |
| 7.4 | Speed | 140 | 178 | core | 126 | 2 | 3 | Kernels and correlation | Full |
| 8.1 | The Family of Fourier Transform | 141 | 179 | core | 114 | 1 | 3 | Build a signal from DFT basis functions | Full |
| 8.2 | Notation and Format of the Real DFT | 146 | 184 | core | 121 | 2 | 3 | Build a signal from DFT basis functions | Full |
| 8.3 | The Frequency Domain's Independent Variable | 148 | 186 | core | 119 | 2 | 3 | Build a signal from DFT basis functions | Full |
| 8.4 | DFT Basis Functions | 150 | 188 | core | 128 | 2 | 3 | Build a signal from DFT basis functions | Full |
| 8.5 | Synthesis, Calculating the Inverse DFT | 152 | 190 | core | 84 | 1 | 3 | Build a signal from DFT basis functions | Full |
| 8.6 | Analysis, Calculating the DFT | 157 | 195 | core | 95 | 2 | 3 | Build a signal from DFT basis functions | Full |
| 8.7 | Duality | 161 | 199 | advanced | 120 | 0 | 3 | Explanation-only | Explanation-only |
| 8.8 | Polar Notation | 161 | 199 | core | 76 | 2 | 3 | Build a signal from DFT basis functions | Full |
| 8.9 | Polar Nuisances | 164 | 202 | core | 140 | 0 | 4 | Build a signal from DFT basis functions | Full |
| 9.1 | Spectral Analysis of Signals | 169 | 207 | core | 138 | 2 | 3 | Windows, leakage, and convolution | Full |
| 9.2 | Frequency Response of Systems | 177 | 215 | core | 133 | 2 | 3 | Windows, leakage, and convolution | Full |
| 9.3 | Convolution via the Frequency Domain | 180 | 218 | core | 99 | 2 | 3 | Windows, leakage, and convolution | Full |
| 10.1 | Linearity of the Fourier Transform | 185 | 223 | core | 124 | 1 | 3 | Shift, scale, modulate, and check Parseval | Full |
| 10.2 | Characteristics of the Phase | 188 | 226 | core | 123 | 2 | 3 | Shift, scale, modulate, and check Parseval | Full |
| 10.3 | Periodic Nature of the DFT | 194 | 232 | core | 131 | 0 | 3 | Shift, scale, modulate, and check Parseval | Full |
| 10.4 | Compression and Expansion, Multirate methods | 200 | 238 | core | 111 | 2 | 3 | Shift, scale, modulate, and check Parseval | Full |
| 10.5 | Multiplying Signals (Amplitude Modulation) | 204 | 242 | core | 116 | 2 | 3 | Shift, scale, modulate, and check Parseval | Full |
| 10.6 | The Discrete Time Fourier Transform | 206 | 244 | advanced | 97 | 2 | 3 | Shift, scale, modulate, and check Parseval | Full |
| 10.7 | Parseval's Relation | 208 | 246 | core | 88 | 1 | 3 | Shift, scale, modulate, and check Parseval | Full |
| 11.1 | Delta Function Pairs | 209 | 247 | core | 104 | 2 | 3 | Shapes and their spectra | Full |
| 11.2 | The Sinc Function | 212 | 250 | core | 110 | 2 | 3 | Shapes and their spectra | Full |
| 11.3 | Other Transform Pairs | 215 | 253 | core | 115 | 2 | 3 | Shapes and their spectra | Full |
| 11.4 | Gibbs Effect | 218 | 256 | core | 132 | 0 | 3 | Shapes and their spectra | Full |
| 11.5 | Harmonics | 220 | 258 | core | 114 | 2 | 3 | Shapes and their spectra | Full |
| 11.6 | Chirp Signals | 222 | 260 | advanced | 126 | 2 | 3 | Shapes and their spectra | Full |
| 12.1 | Real DFT Using the Complex DFT | 225 | 263 | core | 123 | 2 | 3 | Inside the butterfly | Full |
| 12.2 | How the FFT works | 228 | 266 | core | 121 | 3 | 3 | Inside the butterfly | Full |
| 12.3 | FFT Programs | 233 | 271 | support | 119 | 0 | 3 | Explanation-only | Explanation-only |
| 12.4 | Speed and Precision Comparisons | 237 | 275 | core | 126 | 2 | 3 | Inside the butterfly | Full |
| 12.5 | Further Speed Increases | 238 | 276 | advanced | 108 | 0 | 3 | Explanation-only | Explanation-only |
| 13.1 | The Delta Function | 243 | 281 | core | 121 | 2 | 3 | From continuous to discrete | Full |
| 13.2 | Convolution | 246 | 284 | core | 110 | 2 | 3 | From continuous to discrete | Full |
| 13.3 | The Fourier Transform | 252 | 290 | core | 106 | 2 | 3 | From continuous to discrete | Full |
| 13.4 | The Fourier Series | 255 | 293 | core | 107 | 2 | 3 | From continuous to discrete | Full |
| 14.1 | Filter Basics | 261 | 299 | core | 142 | 0 | 3 | The filter design trade space | Full |
| 14.2 | How Information is Represented in Signals | 265 | 303 | core | 132 | 0 | 3 | The filter design trade space | Full |
| 14.3 | Time Domain Parameters | 266 | 304 | core | 122 | 2 | 3 | The filter design trade space | Full |
| 14.4 | Frequency Domain Parameters | 268 | 306 | core | 128 | 2 | 3 | The filter design trade space | Full |
| 14.5 | High-Pass, Band-Pass and Band-Reject Filters | 271 | 309 | core | 119 | 2 | 3 | The filter design trade space | Full |
| 14.6 | Filter Classification | 274 | 312 | core | 144 | 0 | 4 | The filter design trade space | Full |
| 15.1 | Implementation by Convolution | 277 | 315 | core | 119 | 3 | 3 | Noise versus edge sharpness | Full |
| 15.2 | Noise Reduction vs. Step Response | 278 | 316 | core | 134 | 2 | 3 | Noise versus edge sharpness | Full |
| 15.3 | Frequency Response | 280 | 318 | core | 117 | 3 | 3 | Noise versus edge sharpness | Full |
| 15.4 | Relatives of the Moving Average Filter | 280 | 318 | support | 139 | 0 | 4 | Explanation-only | Explanation-only |
| 15.5 | Recursive Implementation | 282 | 320 | core | 123 | 2 | 3 | Noise versus edge sharpness | Full |
| 16.1 | Strategy of the Windowed-Sinc | 285 | 323 | core | 134 | 2 | 4 | Design a windowed-sinc filter | Full |
| 16.2 | Designing the Filter | 288 | 326 | core | 129 | 3 | 4 | Design a windowed-sinc filter | Full |
| 16.3 | Examples of Windowed-Sinc Filters | 292 | 330 | core | 154 | 0 | 3 | Design a windowed-sinc filter | Full |
| 16.4 | Pushing it to the Limit | 293 | 331 | advanced | 144 | 0 | 4 | Explanation-only | Explanation-only |
| 17.1 | Arbitrary Frequency Response | 297 | 335 | core | 140 | 2 | 3 | Draw a response, get a filter | Full |
| 17.2 | Deconvolution | 300 | 338 | advanced | 128 | 2 | 3 | Draw a response, get a filter | Full |
| 17.3 | Optimal Filters | 307 | 345 | advanced | 126 | 2 | 4 | Draw a response, get a filter | Full |
| 18.1 | The Overlap-Add Method | 311 | 349 | core | 130 | 2 | 3 | Overlap-add, block by block | Full |
| 18.2 | FFT Convolution | 312 | 350 | core | 121 | 2 | 3 | Overlap-add, block by block | Full |
| 18.3 | Speed Improvements | 316 | 354 | advanced | 134 | 0 | 4 | Explanation-only | Explanation-only |
| 19.1 | The Recursive Method | 319 | 357 | core | 123 | 2 | 3 | Single-pole filters and stability | Full |
| 19.2 | Single Pole Recursive Filters | 322 | 360 | core | 125 | 3 | 4 | Single-pole filters and stability | Full |
| 19.3 | Narrow-band Filters | 326 | 364 | advanced | 151 | 0 | 3 | Explanation-only | Explanation-only |
| 19.4 | Phase Response | 328 | 366 | core | 145 | 0 | 4 | Single-pole filters and stability | Full |
| 19.5 | Using Integers | 332 | 370 | advanced | 125 | 0 | 4 | Explanation-only | Explanation-only |
| 20.1 | The Chebyshev and Butterworth Responses | 333 | 371 | core | 139 | 2 | 3 | Ripple, order, and overshoot | Full |
| 20.2 | Designing the Filter | 334 | 372 | core | 140 | 2 | 3 | Ripple, order, and overshoot | Full |
| 20.3 | Step Response Overshoot | 338 | 376 | core | 129 | 0 | 3 | Ripple, order, and overshoot | Full |
| 20.4 | Stability | 339 | 377 | advanced | 156 | 1 | 3 | Ripple, order, and overshoot | Full |
| 21.1 | Match #1:  Analog vs. Digital Filters | 343 | 381 | core | 136 | 0 | 3 | Four filters, one specification | Full |
| 21.2 | Match #2:  Windowed-Sinc vs. Chebyshev | 346 | 384 | core | 138 | 0 | 3 | Four filters, one specification | Full |
| 21.3 | Match #3:  Moving Average vs. Single Pole | 348 | 386 | core | 149 | 0 | 3 | Four filters, one specification | Full |
| 22.1 | Human Hearing | 351 | 389 | core | 146 | 0 | 3 | Hearing, companding, and data rate | Full |
| 22.2 | Timbre | 355 | 393 | core | 114 | 0 | 3 | Hearing, companding, and data rate | Full |
| 22.3 | Sound Quality vs. Data Rate | 358 | 396 | core | 118 | 1 | 3 | Hearing, companding, and data rate | Full |
| 22.4 | High Fidelity Audio | 359 | 397 | core | 118 | 0 | 3 | Hearing, companding, and data rate | Full |
| 22.5 | Companding | 362 | 400 | core | 129 | 2 | 3 | Hearing, companding, and data rate | Full |
| 22.6 | Speech Synthesis and Recognition | 364 | 402 | core | 132 | 0 | 3 | Hearing, companding, and data rate | Full |
| 22.7 | Nonlinear Audio Processing | 368 | 406 | advanced | 132 | 0 | 4 | Explanation-only | Explanation-only |
| 23.1 | Digital Image Structure | 373 | 411 | core | 144 | 2 | 3 | Pixels, brightness, and warping | Full |
| 23.2 | Cameras and Eyes | 376 | 414 | core | 132 | 0 | 3 | Pixels, brightness, and warping | Full |
| 23.3 | Television Video Signals | 384 | 422 | support | 127 | 0 | 3 | Explanation-only | Explanation-only |
| 23.4 | Other Image Acquisition and Display | 386 | 424 | support | 115 | 0 | 3 | Explanation-only | Explanation-only |
| 23.5 | Brightness and Contrast Adjustments | 387 | 425 | core | 111 | 2 | 3 | Pixels, brightness, and warping | Full |
| 23.6 | Grayscale Transforms | 390 | 428 | core | 120 | 0 | 3 | Pixels, brightness, and warping | Full |
| 23.7 | Warping | 394 | 432 | core | 125 | 1 | 3 | Pixels, brightness, and warping | Full |
| 24.1 | Convolution | 397 | 435 | core | 116 | 2 | 3 | Kernels, separability, and spectra | Full |
| 24.2 | 3×3 Edge Modification | 402 | 440 | core | 110 | 3 | 3 | Kernels, separability, and spectra | Full |
| 24.3 | Convolution by Separability | 404 | 442 | core | 118 | 2 | 3 | Kernels, separability, and spectra | Full |
| 24.4 | Example of a Large PSF: Illumination Flattening | 407 | 445 | core | 125 | 2 | 3 | Kernels, separability, and spectra | Full |
| 24.5 | Fourier Image Analysis | 410 | 448 | core | 128 | 0 | 3 | Kernels, separability, and spectra | Full |
| 24.6 | FFT Convolution | 416 | 454 | core | 105 | 1 | 3 | Kernels, separability, and spectra | Full |
| 24.7 | A Closer Look at Image Convolution | 418 | 456 | advanced | 127 | 0 | 4 | Explanation-only | Explanation-only |
| 25.1 | Spatial Resolution | 423 | 461 | core | 133 | 2 | 3 | Resolution, morphology, and CT | Full |
| 25.2 | Sample Spacing and Sampling Aperture | 430 | 468 | core | 134 | 0 | 3 | Resolution, morphology, and CT | Full |
| 25.3 | Signal-to-Noise Ratio | 432 | 470 | core | 126 | 2 | 3 | Resolution, morphology, and CT | Full |
| 25.4 | Morphological Image Processing | 436 | 474 | core | 124 | 2 | 3 | Resolution, morphology, and CT | Full |
| 25.5 | Computed Tomography | 442 | 480 | advanced | 139 | 2 | 3 | Resolution, morphology, and CT | Full |
| 26.1 | Target Detection | 451 | 489 | core | 134 | 2 | 3 | Train a perceptron | Full |
| 26.2 | Neural Network Architecture | 458 | 496 | core | 135 | 2 | 3 | Train a perceptron | Full |
| 26.3 | Why Does It Work? | 463 | 501 | core | 123 | 0 | 3 | Train a perceptron | Full |
| 26.4 | Training the Neural Network | 465 | 503 | core | 132 | 2 | 3 | Train a perceptron | Full |
| 26.5 | Evaluating the Results | 473 | 511 | core | 122 | 2 | 3 | Train a perceptron | Full |
| 26.6 | Recursive Filter Design | 476 | 514 | advanced | 144 | 0 | 3 | Explanation-only | Explanation-only |
| 27.1 | Data Compression Strategies | 481 | 519 | core | 116 | 2 | 3 | Compress text and images | Full |
| 27.2 | Run-Length Encoding | 483 | 521 | core | 116 | 0 | 3 | Compress text and images | Full |
| 27.3 | Huffman Encoding | 484 | 522 | core | 126 | 2 | 3 | Compress text and images | Full |
| 27.4 | Delta Encoding | 486 | 524 | core | 111 | 2 | 3 | Compress text and images | Full |
| 27.5 | LZW Compression | 488 | 526 | core | 126 | 0 | 3 | Compress text and images | Full |
| 27.6 | JPEG (Transform Compression) | 494 | 532 | core | 120 | 2 | 3 | Compress text and images | Full |
| 27.7 | MPEG | 501 | 539 | core | 122 | 0 | 3 | Compress text and images | Full |
| 28.1 | How DSPs are Different from Other Microprocessors | 503 | 541 | core | 126 | 0 | 3 | Circular buffers and the MAC loop | Full |
| 28.2 | Circular Buffering | 506 | 544 | core | 140 | 2 | 3 | Circular buffers and the MAC loop | Full |
| 28.3 | Architecture of the Digital Signal Processor | 509 | 547 | support | 126 | 0 | 3 | Explanation-only | Explanation-only |
| 28.4 | Fixed versus Floating Point | 514 | 552 | core | 132 | 0 | 3 | Circular buffers and the MAC loop | Full |
| 28.5 | C versus Assembly | 520 | 558 | support | 120 | 0 | 3 | Explanation-only | Explanation-only |
| 28.6 | How Fast are DSPs? | 526 | 564 | support | 129 | 2 | 3 | Circular buffers and the MAC loop | Full |
| 28.7 | The Digital Signal Processor Market | 531 | 569 | support | 116 | 0 | 3 | Explanation-only | Explanation-only |
| 29.1 | The ADSP-2106x family | 535 | 573 | support | 129 | 0 | 3 | Explanation-only | Explanation-only |
| 29.2 | The SHARC EZ-KIT Lite | 537 | 575 | support | 120 | 0 | 3 | Explanation-only | Explanation-only |
| 29.3 | Design Example: An FIR Audio Filter | 538 | 576 | core | 143 | 1 | 3 | Size a real-time FIR audio filter | Full |
| 29.4 | Analog measurements on a DSP system | 542 | 580 | core | 116 | 0 | 3 | Size a real-time FIR audio filter | Full |
| 29.5 | Another Look at Fixed versus Floating Point | 544 | 582 | core | 128 | 0 | 3 | Size a real-time FIR audio filter | Full |
| 29.6 | Advanced Software Tools | 546 | 584 | support | 108 | 0 | 3 | Explanation-only | Explanation-only |
| 30.1 | The Complex Number System | 551 | 589 | core | 99 | 3 | 3 | Rotate, multiply, and filter | Full |
| 30.2 | Polar Notation | 555 | 593 | core | 94 | 3 | 3 | Rotate, multiply, and filter | Full |
| 30.3 | Using Complex Numbers by Substitution | 557 | 595 | core | 107 | 2 | 3 | Rotate, multiply, and filter | Full |
| 30.4 | Complex Representation of Sinusoids | 559 | 597 | core | 112 | 2 | 3 | Rotate, multiply, and filter | Full |
| 30.5 | Complex Representation of Systems | 561 | 599 | core | 112 | 2 | 3 | Rotate, multiply, and filter | Full |
| 30.6 | Electrical Circuit Analysis | 563 | 601 | support | 114 | 2 | 3 | Rotate, multiply, and filter | Full |
| 31.1 | The Real DFT | 567 | 605 | core | 113 | 1 | 3 | The complex spectrum, including negative frequencies | Full |
| 31.2 | Mathematical Equivalence | 569 | 607 | core | 114 | 2 | 3 | The complex spectrum, including negative frequencies | Full |
| 31.3 | The Complex DFT | 570 | 608 | core | 100 | 2 | 3 | The complex spectrum, including negative frequencies | Full |
| 31.4 | The Family of Fourier Transforms | 575 | 613 | core | 112 | 0 | 3 | The complex spectrum, including negative frequencies | Full |
| 31.5 | Why the Complex Fourier Transform is Used | 577 | 615 | core | 115 | 0 | 4 | The complex spectrum, including negative frequencies | Full |
| 32.1 | The Nature of the s-Domain | 581 | 619 | core | 103 | 2 | 3 | Poles, zeros, and the s-plane | Full |
| 32.2 | Strategy of the Laplace Transform | 588 | 626 | core | 102 | 2 | 3 | Poles, zeros, and the s-plane | Full |
| 32.3 | Analysis of Electric Circuits | 592 | 630 | core | 99 | 2 | 3 | Poles, zeros, and the s-plane | Full |
| 32.4 | The Importance of Poles and Zeros | 597 | 635 | core | 124 | 2 | 4 | Poles, zeros, and the s-plane | Full |
| 32.5 | Filter Design in the s-Domain | 600 | 638 | advanced | 134 | 3 | 4 | Poles, zeros, and the s-plane | Full |
| 33.1 | The Nature of the z-Domain | 605 | 643 | core | 130 | 3 | 3 | Poles, zeros, and digital stability | Full |
| 33.2 | Analysis of Recursive Systems | 610 | 648 | core | 111 | 3 | 3 | Poles, zeros, and digital stability | Full |
| 33.3 | Cascade and Parallel Stages | 616 | 654 | core | 112 | 2 | 3 | Poles, zeros, and digital stability | Full |
| 33.4 | Spectral Inversion | 619 | 657 | core | 116 | 2 | 3 | Poles, zeros, and digital stability | Full |
| 33.5 | Gain Changes | 621 | 659 | core | 122 | 2 | 3 | Poles, zeros, and digital stability | Full |
| 33.6 | Chebyshev-Butterworth Filter Design | 623 | 661 | advanced | 130 | 2 | 3 | Poles, zeros, and digital stability | Full |
| 33.7 | The Best and Worst of DSP | 630 | 668 | core | 135 | 0 | 4 | Poles, zeros, and digital stability | Full |

## Prerequisite map

| Chapter | Recommended prerequisites |
|---|---|
| 1. The Breadth and Depth of DSP | None |
| 2. Statistics, Probability and Noise | Ch. 1 |
| 3. ADC and DAC | Ch. 1, Ch. 2 |
| 4. DSP Software | Ch. 2, Ch. 3 |
| 5. Linear Systems | Ch. 2, Ch. 3 |
| 6. Convolution | Ch. 5 |
| 7. Properties of Convolution | Ch. 6 |
| 8. The Discrete Fourier Transform | Ch. 5, Ch. 6 |
| 9. Applications of the DFT | Ch. 8 |
| 10. Fourier Transform Properties | Ch. 8, Ch. 9 |
| 11. Fourier Transform Pairs | Ch. 8, Ch. 10 |
| 12. The Fast Fourier Transform | Ch. 8, Ch. 10 |
| 13. Continuous Signal Processing | Ch. 6, Ch. 8, Ch. 11 |
| 14. Introduction to Digital Filters | Ch. 6, Ch. 7, Ch. 8, Ch. 11 |
| 15. Moving Average Filters | Ch. 6, Ch. 7 |
| 16. Windowed-Sinc Filters | Ch. 11, Ch. 14, Ch. 15 |
| 17. Custom Filters | Ch. 8, Ch. 9, Ch. 14, Ch. 16 |
| 18. FFT Convolution | Ch. 9, Ch. 12, Ch. 16 |
| 19. Recursive Filters | Ch. 14, Ch. 15 |
| 20. Chebyshev Filters | Ch. 14, Ch. 19 |
| 21. Filter Comparison | Ch. 14, Ch. 15, Ch. 16, Ch. 19, Ch. 20 |
| 22. Audio Processing | Ch. 3, Ch. 8, Ch. 14 |
| 23. Image Formation & Display | Ch. 3, Ch. 8 |
| 24. Linear Image Processing | Ch. 6, Ch. 7, Ch. 8, Ch. 23 |
| 25. Special Imaging Techniques | Ch. 23, Ch. 24 |
| 26. Neural Networks (and more!) | Ch. 5, Ch. 8, Ch. 22, Ch. 25 |
| 27. Data Compression | Ch. 8, Ch. 21, Ch. 22, Ch. 23 |
| 28. Digital Signal Processors | Ch. 4, Ch. 12, Ch. 18 |
| 29. Getting Started with DSPs | Ch. 16, Ch. 28 |
| 30. Complex Numbers | Ch. 5, Ch. 8 |
| 31. The Complex Fourier Transform | Ch. 8, Ch. 30 |
| 32. The Laplace Transform | Ch. 13, Ch. 20, Ch. 30 |
| 33. The z-Transform | Ch. 19, Ch. 20, Ch. 30, Ch. 31, Ch. 32 |

## Notes on the source

- The PDF contains a duplicated 24-page block: PDF pages 49–72 repeat PDF pages 25–48 (Chapter 2). The index uses the first copy; printed book page numbers are preserved.
- The source uses “Nyquist frequency” and “Nyquist rate” interchangeably for half the sampling rate. The course flags this ambiguity.
- Cutoff definitions differ by filter family: the source uses −3 dB for Butterworth/Chebyshev and 50% amplitude for windowed-sinc. The labs preserve those conventions.
- Chebyshev ripple is given as a percentage in the source; the labs show dB, with the relation explained.
- Hardware details in Chapters 28–29 are specific to the late-1990s ADSP-2106x/SHARC generation.
