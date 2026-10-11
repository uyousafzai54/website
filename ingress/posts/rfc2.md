---
number: 2
title: on sandboxes, random access encrypted memories and predicting the future
date: 2026-10-09
draft: true
aliases: on-predicting-the-future
---

Two <i>and a half</i> years ago, I had just left my winter internship at Apple in Seattle (s/o 333 Dexter Ave. N.). Apple was gracious enough to let my curious mind ask and look around, from iMessage to CoreOS to ASE. It felt as if I had seen the future; no, not quite; I had seen *fragments* of a future. Yet I couldn't immediately understand or put together what these fragments were. 

I can now. And funnily enough, unbeknownst to me, I had caught a glimpse of the full machine; I just didn't realize it at the time.

[Secure Boot \[further writing in progress...\].](https://github.com/uyousafzai54/sel4-service-mesh/blob/main/End-to-End-Service-Mesh-Secure-Boot.md)

The RFC document above is a collection of ideas I wrote down one week after my internship ended where I was interested in the ideas of secure provisioning and remote hardware attestation. In this blog, let's go line by line and see how my ideas have held up to the test of time.

> End to End Service Mesh: Secure Boot (Need Cool Name)

I still don't have a cool name.

> This means that we can statically determine if the kernel is ready to be able to bootstrap the inital loaders.

I got the terminology mixed backwards. We want a bootloader to determine if it is ready to bootstrap the kernel and then the OS.

> We can create a cache of correct function traces that is allowed by the kernel.

I'm not sure what this means.

> And then a microkernel watches every singular call made by the main kernel that is supposed to spawn important services.

Ah. I believe I was talking about a [Secure Enclave-esque](https://support.apple.com/en-ca/guide/security/sec59b0b31ff/web) mechanism here. Secure Enclave, running sepOS, is a mechanism on Apple Silicon devices where a custom designed hardware (co-processor) which is either a BMC, a bootloader, or both, helps bring up the Apple kernel among other things. Secure Enclave works in conjunction with iBoot and BootROM.

> And to ensure security of the microkernel demon, we can simply extend it to at least 2 or more replicas.

I disagree with this complexity. And this idea may not even work or be efficient. We don't need microkernel replicas for this job.

> The loaders in the main kernel are for important things we need before a "service" runs.

Agreed. Except this microkernel that boots up the running "normal" kernel which then brings up the OS.

> These initial loaders shouldn't be assumed to be trusted by default (default ring security structure).

Huge point. There is a huge gap in security for software and firmware that all computers depend on. This was recently discovered again in the [BMC vulnerability](https://arstechnica.com/security/2026/08/thousands-of-servers-can-be-backdoored-by-exploiting-buggy-motherboard-controllers/) where thousands of server racks could be backdoored by always-on firmware.

> Instead, we should employ Linux daemon like "services" that are very lightweight microkernels to check the security of these loaders. These microkernels are able to directly interact with the main kernel containing the loaders and check memory.

Yep. Still makes sense to me.

> These microkernels can use cryptographic methods to verify memory correctness and use ECC techniques such as parity bit checks to ensure that every singular bit in both the stack and heap is correct.

Okay, there's a lot to unpack in this sentence, and some of it is incorrect. Using cryptographic methods to verify memory correctness is a valid idea. In fact, this is what Apple's Secure Enclave [does](https://support.apple.com/en-ca/guide/security/sec59b0b31ff/web#:~:text=Memory%20Protection%20Engine). The latter part of the sentence is incorrect and reveals my systems and cryptography knowledge shortcomings *at the time*. Error-correcting code (ECC) memory is used for correctness, not security. What you actually need to accomplish this is memory encryption alongside a *Cipher Method Authentication Code* tag, aka a keyed cryptographic hash.

An exercise for the reader above is the following: Is it better to encrypt-then-MAC or MAC-then-encrypt?

> The cryptographic methods can also use other techniques to obfcuscate virtual memory mapping for further security.

This is sort of true? While Address Space Layout Randomization is common these days, I think I was talking about Pointer Authentication Codes ([PAC](https://developer.apple.com/documentation/security/preparing-your-app-to-work-with-pointer-authentication)). Simply explained, a PAC adds integrity validation to the pointer itself by having the CPU sign the unused high-order bits of the pointer. Per [Apple docs](https://developer.apple.com/documentation/security/preparing-your-app-to-work-with-pointer-authentication#:~:text=The%20CPU%20interprets,app%20to%20crash.):

> The CPU interprets authentication failure as memory corruption and sets a high-order bit in the pointer, making the pointer invalid and causing the app to crash.

This is further combined with [Memory Integrity Enforcement](https://security.apple.com/blog/memory-integrity-enforcement/), a hardware-level security feature. In summary, MIE is a hardware and software system to ensure the integrity of *all* memory accesses and prevent complex memory chain attacks that are common in other UNIX systems.

> All of this results in us employing zero trust/no trust at the root level from which every process spawns while also ensuring that memory is fully clean/correct. I believe this is one method of achieving perfect kernel startup security guarantee when employing zero trust/no trust default rule.

I think this is still _mostly_ true. As Apple has shown via its memory integrity features and deep hardware security features such as the Secure Enclave, all of these primitives help provision a new system from scratch that is *secure* and *authenticated*.

> Why? We are trying to create a complete end to end service mesh archiecture from the ground up.

Ok, we finally get to the "thesis" of this RFC. At the time, two years ago, I still wasn't sure what the whole picture was. I mean if [seL4](https://sel4.systems) exists, then we have secure boot, right?

__Wrong__.

seL4 assures the security of the running microkernel, but importantly it assumes that this microkernel is brought up "correctly" and "securely" via firmware on the hardware itself. So then, quis custodiet ipsos custodes? And what happens when we scale from one computer to many computers, acting as nodes in a larger mesh? When a new node is introduced, how does the existing mesh validate its boot up? What if that node is malicious?

> Why? We are trying to create a complete end to end service mesh archiecture from the ground up.
> We knew that gRPC and monitoring were vital pieces required in each "node".
> So we could have a secure gRPC channel as a loader, a secure Open Telemetry (OTel) exporter loader and a third optional secure service args loaders.
> None of these should be truste d by default including the provided bare gRPC channel, so we decided to try this experiment.

Finally. What I actually wanted to create was a system for remote attestation when a group of these "secure" computers were working together in a mesh. But why mention gRPC and Open Telemetry (OTel)? Especially when getting a basic but performant networking stack working on seL4 is an incredible amount of work. And what is OTel?






