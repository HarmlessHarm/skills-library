---
name: changelog
title: Changelog
description: Draft a changelog entry from the commits since the last release tag.
tags: [example, releases, writing]
version: 1.0.0
argument-hint: "[since-tag]"
---

Draft a changelog entry for this repository.

1. Find the range: use `$1` as the starting tag when given, otherwise
   `git describe --tags --abbrev=0`.
2. List the commits in that range with `git log --oneline <range>`.
3. Group them under **Added**, **Changed**, **Fixed** and **Removed**. Drop merge commits,
   version bumps and anything with no user-visible effect.
4. Rewrite each line for someone who has not read the diff — say what changed for them, not
   which function moved.
5. Print the result as markdown. Do not write it to a file unless asked.

If the range is empty, say there is nothing to release rather than inventing entries.
