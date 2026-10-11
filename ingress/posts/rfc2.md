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

The RFC document above is a collection of ideas I wrote down one week after my internship where I was interested in the ideas of secure provisioning and remote hardware attestation. In this blog, let's go line by line and see how my ideas have help up to the test of time. 

> End to End Service Mesh: Secure Boot (Need Cool Name)

I still don't have a cool name. 

> This means that we can statically determine if the kernel is ready to be able to bootstrap the inital loaders.

I got the terminology mixed backwards. We want a bootloader to determine if it is ready to bootstrap the kernel and then the OS. 

> We can create a cache of correct function traces that is allowed by the kernel.

I'm not sure what this means.

> And then a microkernel watches every singular call made by the main kernel that is supposed to spawn importan services.

Ah. I believe I was talking about a Secure Enclave-esque similar mechanism here. 

