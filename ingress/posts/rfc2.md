---
number: 2
title: on sandboxes, random access encrypted memories and manifesting the future
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

For the record, here is what that chain actually looks like on a Mac with Apple silicon, per [Apple's Platform Security guide](https://support.apple.com/guide/security/secac71d5623/web). The Boot ROM is immutable code in the SoC and the first link in the chain of trust; it verifies and loads the Low-Level Bootloader (LLB). LLB verifies and loads the firmware for the other cores on the SoC (storage, display, system management, Thunderbolt controllers), loads the LocalPolicy, and verifies iBoot. iBoot loads the remaining paired firmware (Secure Neural Engine, Always On Processor), verifies the kernel collection, checks the root hash of the signed system volume (SSV) so the file system the kernel is about to mount is integrity verified, and only then hands off to XNU. Each stage verifies the next *before* jumping to it, and nothing verifies the Boot ROM: it is trusted because it is silicon. The LocalPolicy decides *how* LLB verifies iBoot: in Full Security it must carry a signature personalized to this exact machine; in Reduced or Permissive Security a "global" signature bundled with the OS is enough, which is what lets you boot older macOS versions or your own kernel.

> We can create a cache of correct function traces that is allowed by the kernel.

I'm not sure what this means.

> And then a microkernel watches every singular call made by the main kernel that is supposed to spawn important services.

Ah. I believe I was talking about a [Secure Enclave-esque](https://support.apple.com/en-ca/guide/security/sec59b0b31ff/web) mechanism here. Secure Enclave, running sepOS, is a mechanism on Apple Silicon devices where custom designed hardware SoC (co-processor) that provides hardware security isolation. Secure Enclave works in conjunction with iBoot, BootROM, Low-Level Bootloader (LLB) and System Integrity Protection (SIP) to help bring up the entire OS on Apple devices. 

Concretely, the Secure Enclave's part in boot is this. It has its [own Boot ROM](https://support.apple.com/guide/security/sec59b0b31ff/web), separate from the Application Processor's, which establishes a root of trust for the coprocessor. iBoot assigns it a dedicated region of DRAM and hands it the sepOS image; the Secure Enclave Boot ROM checks the image's hash and signature and refuses to run anything else until the next chip reset if they don't match. On A13 and later, a Boot Monitor resets the Secure Enclave processor, hashes the loaded sepOS, and only then flips the System Coprocessor Integrity Protection (SCIP) settings to make that code executable; it keeps a running hash of everything made executable afterwards and feeds the final value to the Public Key Accelerator, so keys bound to the OS simply don't derive if the wrong sepOS booted. On the Mac side, the LocalPolicy that LLB enforces is signed by a key that only exists inside this machine's Secure Enclave, and LLB asks the Secure Enclave Boot ROM for an anti-replay value from the Secure Storage Component to make sure an old, more permissive policy can't be replayed. That is a lot more specific than "watches every singular call", but it is the same instinct: a smaller, separately booted component that the main kernel cannot override.

> And to ensure security of the microkernel demon, we can simply extend it to at least 2 or more replicas.

I disagree with this complexity. And this idea may not even work or be efficient. We don't need microkernel replicas for this job.

What you want instead of replicas is privilege separation, and Apple shipped roughly this. The [Secure Page Table Monitor (SPTM)](https://support.apple.com/guide/security/sec8b776536b/web) runs at a higher privilege level than the kernel and owns the page tables for both user and kernel processes; the Trusted Execution Monitor (TXM) runs below it and enforces the code-execution policy. The split is deliberate: a TXM compromise does not automatically become an SPTM bypass. The threat model is explicitly an attacker who already has kernel write and has beaten control-flow protections, which is about as close to "a microkernel watching the main kernel" as my 2024 self was going to get. On A15/M2 and later it replaces the Page Protection Layer (PPL), which relied on kernel trust during early boot; SPTM does not. Two caveats worth knowing: it guards page tables and code signing, not every system call, and the code-signing enforcement is off on macOS because macOS is designed to run arbitrary code.

> The loaders in the main kernel are for important things we need before a "service" runs.

Agreed. Except this microkernel that boots up the running "normal" kernel which then brings up the OS.

> These initial loaders shouldn't be assumed to be trusted by default (default ring security structure).

Huge point. There is a huge gap in security for software and firmware that all computers depend on. This was recently discovered again in the [BMC vulnerability](https://arstechnica.com/security/2026/08/thousands-of-servers-can-be-backdoored-by-exploiting-buggy-motherboard-controllers/) where thousands of servers could be backdoored by always-on firmware via the internet. 

A baseboard management controller (BMC) is a separate microcontroller on the motherboard with its own firmware, operating system, network stack and IP address. It can power cycle the host, reflash its firmware and reinstall its OS, and it works while the host is off. HD Moore's Black Hat research found more than 86,000 BMCs exposing a management service to the internet, over half with at least one critical vulnerability, and roughly 75,000 still vulnerable to [CVE-2013-4786](https://nvd.nist.gov/vuln/detail/CVE-2013-4786), the IPMI 2.0 RAKP flaw that hands an unauthenticated attacker a password hash to crack offline. The bug classes are the usual ones (authentication handshake bypasses, session identifiers derived from counters or clocks, pre-authentication memory corruption in the management SSH service), but the one that matters for this post is unsigned or attacker-controllable firmware: an administrator on the BMC could install a persistent implant *or replace the key used to verify firmware*. That is the "loader trusted by default" failure exactly. The fix is the same shape as Apple's chain: a hardware root of trust that verifies the BMC's firmware before it runs, which is what [NIST SP 800-193](https://csrc.nist.gov/pubs/sp/800/193/final) (Platform Firmware Resiliency: protect, detect, recover) asks of platform vendors.

> Instead, we should employ Linux daemon like "services" that are very lightweight microkernels to check the security of these loaders. These microkernels are able to directly interact with the main kernel containing the loaders and check memory.

Yep. Still makes sense to me.

> These microkernels can use cryptographic methods to verify memory correctness and use ECC techniques such as parity bit checks to ensure that every singular bit in both the stack and heap is correct.

Okay, there's a lot to unpack in this sentence, and some of it is incorrect. Using cryptographic methods to verify memory correctness is a valid idea. In fact, this is what Apple's Secure Enclave [does](https://support.apple.com/en-ca/guide/security/sec59b0b31ff/web#:~:text=Memory%20Protection%20Engine). The latter part of the sentence is incorrect and reveals my systems and cryptography knowledge shortcomings *at the time*. Error-correcting code (ECC) memory is used for correctness, not security. What you actually need to accomplish this is memory encryption alongside a *Message Authentication Code* tag, aka a keyed cryptographic hash. Apple chooses to use a cipher-based MAC here. 

Why ECC can't do this job: a SECDED Hamming code corrects any single-bit flip and detects double-bit flips, which is what it is for (cosmic rays, marginal DRAM cells). But it is a linear code with no secret. An attacker who can write to memory can write the data *and* the matching check bits. Security needs a key the attacker doesn't have, and that is what a MAC is.

Here is what Apple's [Memory Protection Engine](https://support.apple.com/guide/security/sec59b0b31ff/web#:~:text=Memory%20Protection%20Engine) does for the Secure Enclave's region of DRAM. At startup the Secure Enclave Boot ROM generates a random, ephemeral memory protection key. Every write encrypts the block with AES in XEX (xor-encrypt-xor) mode and computes a CMAC tag that is stored alongside the ciphertext; every read verifies the tag first and decrypts only if it matches. A mismatch is treated as an attack, not a fault: the Secure Enclave stops accepting requests until the system reboots. Encryption plus a MAC still leaves replay, i.e. writing back a valid *old* block, so from the A11 and S4 onwards each block also carries an anti-replay value folded into the CMAC, and the anti-replay values are protected by an integrity tree rooted in SRAM inside the Secure Enclave, where external DRAM attackers can't reach. From the A14 and M1 there are two keys, one for memory private to the Secure Enclave and one for memory shared with the Secure Neural Engine. All of this is inline: sepOS reads and writes what looks like plain DRAM, and anyone probing the bus sees ciphertext and tags.

An exercise for the reader above is the following: Is it better to encrypt-then-MAC or MAC-then-encrypt?

<details>
<summary>answer</summary>

Encrypt-then-MAC. [Bellare and Namprempre (2000)](https://eprint.iacr.org/2000/025) analysed the three generic compositions and showed that, given an IND-CPA-secure cipher and an unforgeable MAC, encrypt-then-MAC is the only one that is secure in general: it gives integrity of ciphertexts, which in turn gives chosen-ciphertext security. MAC-then-encrypt is not generically secure, and the practical consequence was a decade of padding-oracle attacks on TLS's MAC-then-encrypt CBC mode ([Vaudenay 2002](https://link.springer.com/chapter/10.1007/3-540-46035-7_35), [Lucky Thirteen 2013](https://www.isg.rhul.ac.uk/tls/Lucky13.html)), because the receiver had to decrypt *before* it could tell whether the message was genuine. Apple's description above, verify the tag and decrypt only if it matches, is the encrypt-then-MAC order.

</details>

> The cryptographic methods can also use other techniques to obfcuscate virtual memory mapping for further security.

This is sort of true? While Address Space Layout Randomization is common these days, I think I was talking about a mechanism similar to Pointer Authentication Codes ([PAC](https://developer.apple.com/documentation/security/preparing-your-app-to-work-with-pointer-authentication)). Simply explained, a PAC adds integrity validation to the pointer itself by having the CPU sign the value of the pointer and store the signature in the unused high-order bits of the pointer. Per [Apple docs](https://developer.apple.com/documentation/security/preparing-your-app-to-work-with-pointer-authentication#:~:text=The%20CPU%20interprets,app%20to%20crash.):

> The CPU interprets authentication failure as memory corruption and sets a high-order bit in the pointer, making the pointer invalid and causing the app to crash.

Some detail on how the signature is computed, from Apple's [Operating system integrity](https://support.apple.com/guide/security/sec8b776536b/web) page. PAC is Arm's pointer authentication (the `arm64e` ABI), which Apple shipped first in the A12 in 2018. The signature is a function of the pointer value, one of five 128-bit keys held in CPU registers (IA and IB for code pointers, DA and DB for data pointers, GA for generic signing), and a salt. The salt is what stops an attacker from reusing a validly signed pointer somewhere else: return addresses are signed with IB and salted with the stack address they are stored at, function pointers with IA and no salt (so shared library code works across processes), and C++ vtable entries with IA salted by a hash of the mangled method name, so a pointer to one virtual method can't be swapped for another. Each user process gets its own B keys. The upshot is that PAC does not hide anything, unlike ASLR; an attacker who leaks every address still cannot forge a code pointer without a key or a signing gadget, which is why the sentence about "obfuscating" was the wrong mental model.

This is further combined with [Memory Integrity Enforcement](https://security.apple.com/blog/memory-integrity-enforcement/), a hardware-level security feature. MIE is a hardware and software system to ensure the integrity of *all* memory accesses and prevent complex memory chain attacks that are common in other UNIX systems.

The hardware half of MIE is the [Enhanced Memory Tagging Extension (EMTE)](https://security.apple.com/blog/memory-integrity-enforcement/). Arm's original MTE (2019) tags every allocation with a small secret and has the hardware refuse any access that doesn't present the matching tag; Apple found the original spec too weak as a real-time defence (it could report corruption asynchronously, leaving a race window) and worked with Arm on EMTE in 2022. MIE runs EMTE strictly synchronously, on by default, and pairs it with the software half: the type-aware secure allocators (`kalloc_type` in the kernel since iOS 15, `xzone malloc` in user space since iOS 17, WebKit's `libpas`) that place allocations so that use-after-free and out-of-bounds bugs can't create overlapping interpretations of memory. The allocators can only enforce at page granularity (16KB on iOS), which separates *type buckets*; tagging is what closes the gap *within* a bucket. Tag Confidentiality Enforcement policies then stop the kernel and apps from leaking the tags themselves. It ships in the A19 and M5 generation (every iPhone 17 and the iPhone Air), and protects what Apple calls the key attack surfaces, including the kernel.

> All of this results in us employing zero trust/no trust at the root level from which every process spawns while also ensuring that memory is fully clean/correct. I believe this is one method of achieving perfect kernel startup security guarantee when employing zero trust/no trust default rule.

This sentence is still _mostly_ true. As Apple has shown via its memory integrity features and deep hardware security features such as the Secure Enclave, all of these primitives help provision a new system from scratch that is *secure* and *authenticated*.

> Why? We are trying to create a complete end to end service mesh archiecture from the ground up.

Ok, we finally get to the "thesis" of this RFC. At the time, two years ago, I still wasn't sure what the whole picture was. I mean if [seL4](https://sel4.systems) exists, then we have secure boot, right?

__Wrong__.

seL4 assures the security of the running microkernel, but importantly it assumes that this microkernel is brought up "correctly" and "securely" via firmware on the hardware itself. So then, <i>quis custodiet ipsos custodes</i>? And what happens when we scale from one computer to many computers, acting as nodes in a larger mesh? When a new node is introduced, how does the existing mesh validate its boot up? What if that node is malicious?

The seL4 team is unusually honest about this; their [list of proof assumptions](https://sel4.systems/Verification/assumptions.html) is short and worth reading. The functional correctness proof covers the kernel *after it has been loaded correctly into memory and brought into a consistent, minimal initial state*. That excludes about 1,200 lines of boot code, plus roughly 340 lines of hand-written assembly for kernel entry, exit and direct hardware access, which are assumed correct. The hardware is assumed to work as modelled and not to have been tampered with. DMA devices are assumed absent or well behaved, so a driver for a DMA-capable NIC can break the kernel's guarantees unless it is itself verified or sits behind an IOMMU. On the plus side, binary verification means you do not have to trust the compiler or linker on supported architectures. So "seL4 is verified" is true and still leaves exactly the gap I was circling: who loaded it, was it the right image, and how would anyone else know?

That last question has a name: remote attestation, and the IETF wrote it up as [RFC 9334](https://www.rfc-editor.org/rfc/rfc9334) (the RATS architecture). The node being judged is the *Attester*; it produces *Evidence*, typically measurements of what was booted, signed by a key that never leaves the hardware. A *Verifier* appraises that Evidence against *Reference Values* (the known-good measurements) and *Endorsements* (the manufacturer vouching that this key lives in real silicon) and emits an *Attestation Result*. A *Relying Party* consumes the result and makes the actual decision: issue a certificate, admit to the mesh, or refuse. Freshness comes from a nonce or an epoch so yesterday's good Evidence can't be replayed today. Map that onto my questions: the new node is the Attester, the mesh control plane is the Verifier, every peer is a Relying Party, and a malicious node is one whose Evidence doesn't match the Reference Values and therefore never receives a credential. Apple's Boot Monitor running hash and OS-bound keys are the single-machine version of the same idea: the key only derives if the measurement is right.

> Why? We are trying to create a complete end to end service mesh archiecture from the ground up.
> We knew that gRPC and monitoring were vital pieces required in each "node".
> So we could have a secure gRPC channel as a loader, a secure Open Telemetry (OTel) exporter loader and a third optional secure service args loaders.
> None of these should be trusted by default including the provided bare gRPC channel, so we decided to try this experiment.

Finally. What I actually wanted to create was a system for remote attestation when a group of these "secure" computers were working together in a mesh. But why mention gRPC and OpenTelemetry (OTel)? Especially when getting a basic but performant networking stack working on seL4 is an [incredible amount of work](https://trustworthy.systems/publications/theses_public/23/Parker:bsc.abstract). And what even is [OTel](https://opentelemetry.io/)?

Technically: OpenTelemetry is a vendor-neutral API and SDK for emitting three signals, traces, metrics and logs, plus a wire protocol, [OTLP](https://opentelemetry.io/docs/specs/otlp/), for shipping them. OTLP is protobuf over gRPC on port 4317 by default, or the same protobuf messages (binary or JSON) POSTed over HTTP/1.1 or HTTP/2 on port 4318. In between the SDK and whatever stores the data usually sits the OTel Collector, a pipeline of receivers, processors and exporters that can batch, redact, re-route and fan out. Prometheus is a pull-based time-series database, so getting push-based OTLP metrics into it means either the collector exporting in Prometheus's own format or Prometheus's [OTLP receiver](https://prometheus.io/docs/guides/opentelemetry/), which is off by default (`--web.enable-otlp-receiver`) and listens on `/api/v1/otlp/v1/metrics`. Prometheus stores metrics only; logs and traces need their own backends. So when I wrote "a secure gRPC channel as a loader" and "a secure OTel exporter loader", the concrete thing I was asking for was an HTTP/2 connection and an OTLP exporter that exist, with verified identities, before the node runs any application code.


At this point, we need to take a small detour and talk about what I actually built at Apple for the Tips app. The goal of Instructional Products as a whole is to empower users to naturally learn all the amazing features of their new device. This is done via beautiful animations and small nudges from Tips as they swipe around and click around in iOS and macOS. Crucially, the logic behind these tips must be on device to preserve user privacy and work for all supported device and software permutations. And as part of the yearly software release after WWDC, validations were run on these collections of tips. My intern project was to instrument the backend services that supported this for telemetry so errors during publishing and validations could be surfaced. 


To be honest, I wasn't super stoked about this project initially as a year ago my internship at Carta also involved instrumentation and observability of gRPC services. However, this project at Apple required close collaboration with Apple Services Engineering (ASE) and involved some of my favourite tools to work with including gRPC, Kubernetes (k8s), [k9s](https://k9scli.io/) and time-series databases. I somewhat reluctantly agreed to work on this and immediately started reading developer docs on Apple's internal observability platform and OpenTelemetry.

A few weeks later, I had one service in our service mesh instrumented with an OpenTelemetry SDK sending encrypted telemetry (logs and metrics) via mutual TLS (mTLS) to an OTel collector running in k8s that forwarded the encrypted traffic to ASE's backend Prometheus engine where I could then query them on the frontend. I was mainly surprised at how the simplicity of this architecture allowed me to query thousands of logs and metrics within milliseconds of exporting them. 

The mTLS part is the one that matters for the rest of this post. In ordinary TLS only the server proves who it is; in mutual TLS the client presents an X.509 certificate too, and the server refuses the handshake unless that certificate chains to a CA it trusts. In OTel Collector terms that is the receiver's `tls` block with a `client_ca_file`: an exporter without a certificate signed by that CA cannot even open the connection, let alone write a metric. Which immediately raises the question the rest of this post is about. The certificate is the service's identity, and *something* had to decide this pod deserved it and hand it over at startup. Inside a Kubernetes mesh that is the mesh's own CA trusting the API server's word for which pod is which ([SPIFFE](https://spiffe.io/docs/latest/spiffe-about/overview/) formalises the identity format). Pull the thread one level down, to bare metal, and the only honest answer to "why does this node deserve a certificate?" is attestation of how it booted.

[![An OpenTelemetry SDK in a Kubernetes service mesh sends logs, metrics and traces over mTLS to a collector in Kubernetes, which forwards encrypted telemetry to ASE's observability backend. Prometheus stores metrics, with separate log and trace storage and a query frontend.](/diagrams/observability-architecture.svg)](/diagrams/observability-architecture.svg)

On the plane ride back to Canada from Seattle, after enjoying the high of doing a presentation to my VP of SWEOps Cheryl Thomas at Apple Park in Cupertino (a sentence that is still hard for me to believe while writing this), I kept wondering what more could be done with my simple little observability architecture? What if we abstract away what the service does entirely? What if we treat the microservice as an arbitrary node in a service mesh of computers, running an arbitrary program as simple as a Python or Swift Hello, World? What's left then? What more does it need other than a gRPC channel to network and a gRPC channel for structured observability emission? And how does one provision such a node and bring it up correctly, and <i>securely</i>?

