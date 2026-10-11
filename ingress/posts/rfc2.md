---
number: 2
title: on sandboxes, encrypted memories and predicting the future
date: 2026-10-09
draft: true
aliases: on-predicting-the-future
---

Two years ago, I had just left my winter internship at Apple in Seattle (s/o 333 Dexter Ave. N.). Apple was gracious enough to let my curious mind ask and look around, from iMessage to CoreOS to ASE. It felt as if I had seen the future; No, not quite; I had seen *pieces* of a future. Yet I couldn't immediately understand or put together what these pieces were.

I can now. And funnily enough, unbeknownst to me, I caught a glimpse of the full machine; I just didn't realize.

[Secure Boot \[further writing in progress...\].](https://github.com/uyousafzai54/sel4-service-mesh/blob/main/End-to-End-Service-Mesh-Secure-Boot.md)

The RFC document above is a collection of ideas I wrote down one week after my internship where I was interested in the ideas of secure provisioning and remote hardware attestation. In this blog, let's go line by line and see how my ideas have held up to the test of time. 

> End to End Service Mesh: Secure Boot (Need Cool Name)

I still don't have a cool name. 

> This means that we can statically determine if the kernel is ready to be able to bootstrap the inital loaders.

I got the terminology mixed backwards. We want a bootloader to determine if it is ready to bootstrap the kernel and then the OS. 

> We can create a cache of correct function traces that is allowed by the kernel.

I'm not sure what this means.

> And then a microkernel watches every singular call made by the main kernel that is supposed to spawn important services.

Ah. I believe I was talking about a [Secure Enclave-esque](https://support.apple.com/en-ca/guide/security/sec59b0b31ff/web) similar mechanism here. Secure Enclave, running sepOS is a mechanism on Apple Silicon devices where a custom designed hardware (co-processor) which is either a BMC, a bootloader, or both, helps bring up the Apple kernel among other things.

> And to ensure security of the microkernel demon, we can simply extend it to at least 2 or more replicas.

I disagree with this complexity. And this idea may not even work or be efficient. We don't need microkernel replicas for this job.

> The loaders in the main kernel are for important things we need before a "service" runs.

Agreed. Expect this microkernel that boots up the running "normal" kernel which then brings up the OS. 

> These initial loaders shouldn't be assumed to be trusted by default (default ring security structure).

Huge point. There is a huge gap in security for software and firmware that all computers depend on. This was recently discovered again in the [BMC vulnerability](https://arstechnica.com/security/2026/08/thousands-of-servers-can-be-backdoored-by-exploiting-buggy-motherboard-controllers/) where thousands of server racks could be backdoored by always-on firmware. 

> Instead, we should employ Linux daemon like "services" that are very lightweight microkernels to check the security of these loaders. These microkernels are able to directly interact with the main kernel containing the loaders and check memory.

Yep. Still makes sense to me. 

> These microkernels can use cryptographic methods to verify memory correctness and use ECC techniques such as parity bit checks to ensure that every singular bit in both the stack and heap is correct.

Okay, there's a lot to unpack in this sentence, and some of it is incorrect. Using cryptographic methods to verify memory correctness is a valid idea. In fact, this is what Apple's Secure Enclave [does](https://support.apple.com/en-ca/guide/security/sec59b0b31ff/web#:~:text=Memory%20Protection%20Engine). The later part of the sentence is incorrect and reveals my systems and cryptography knowledge shortcomings, <i> at the time </i>. Error-correcting code (ECC) memory is used for correctness, not security. What you actually need to accomplish this memory encryption alongside a <i>Cipher Method Authentication Code </i> tag, aka a hash. 


