# dotcomma

Dotcomma is a simple esolang designed and first implemented by CGCC user [Redwolf Programs](https://codegolf.stackexchange.com/users/79857/redwolf-programs). It was designed to have as few instructions as possible, while still being interesting. It is based around blocks and operators, with the only two operators (`.` and `,`) having a number of unique purposes depending on context.

Information in dotcomma, represented as signed integers, can be stored either through the return values of blocks and operators, or with a queue.

## Blocks

A block is any section of code that is wrapped in matching brackets `[` and `]`, such as `[.]` or `[.[[,.],],]`. Blocks can be nested arbitrarily deep. Every block has a return value, which defaults to `0`. This can be changed or read with operators.

By default, a block only acts as a container for code and does not affect control flow in any way. The whole program is wrapped in a block by the interpreter.

## The `.` operator

The `.` operator is mainly used for representing constants, reading from blocks, adding numbers, and creating loops.

Its return value depends on what it is immediately preceded by:

- **Any number of blocks:** The sum of the return values of the blocks for each time they are evaluated
- **An operator:** The return value of the operator
- **The beginning of a block (`[`):** `1`

What it does with this return value depends on what it is immediately followed by:

- **A block:** If its return value is `0`, the block is ignored. Otherwise, the block is evaluated until its return value is `0`
- **The end of a block (`]`):** Its return value is used as the block's return value

## The `,` operator

The `,` operator is mainly used for managing the queue, or for various control flow purposes.

Its return value depends on what it is immediately preceded by:

- **A block:** The return value of the last time the block was evaluated, or `-1` if it never evaluated
- **An operator:** The return value of the operator
- **The beginning of a block (`[`):** The front of the queue (which is then removed, similar to popping from a stack), or `-1` if it is empty

What it does with this return value depends on what it is immediately followed by:

- **A block:** If its return value is negative, the block is ignored
- **The end of a block (`]`):** Its return value is used as the block's return value, as well as being added to the back of the queue

## The Queue

A [queue](https://computersciencewiki.org/index.php/Queue) is a way of storing information similar to a stack. While a stack is a Last-In-First-Out data structure, a queue is a First-In-First-Out structure. This means an items at the back of the queue (the most recent added) will not be read until every item in front of it is removed.

The queue starts out containing all input to the program, with the first input at the front of the queue. The state of the queue when the program ends is used as output, with the front of the queue being the first item outputted.

## Format

Any characters other than `[.,]` will be ignored. Any brackets must be balanced.

## Examples

**Output `0`:**

```
[],
```

This program evaluates an empty block, with its return value (defaulting to `0`) being read by the `,`. The `,` is followed by the end of the program (treated as the end of a block), so the result will be outputed.

**Output `1`:**

```
[.],
```

This program is similar to the first. However, the `.`'s return value will be `1` (as it's preceded by the beginning of the block), so it will set the block's return value to `1` (which is read and outputted by `,`).

**Output `2`:**

```
[.][.].,
```

This program is a bit more interesting. The `[.]` (return value `1`) block is repeated twice, and the sum of the two is read with the last `.` (note that it, unlike the `,` operator, takes the sum of every return value of every block directly before it). The `,` will take the `.`'s return value and output it.

**(Don't) output `-1`:**

```
[].[],
```

This program is the first so far that uses control flow. The first empty block has a return value of `0`, so the `.` will cause the second empty block to not be evaluated. Because the `,` operator reads the return value of the previous block's last evaluation, which was never, it will return `-1`. Importantly, if you replaced the `,` with a `.,`, the program would output `0` as the `.` operator will consider a block that has never been evaluated to have a return value of `0` (otherwise, adding the return value of multiple blocks could work in unintended ways if one of them is ignored or looped).

It doesn't output anything, because attempting to add a negative value to the queue does nothing.

**Infinite loop:**

```
.[.]
```

Both `.`'s return values will be `1` (because they is preceded by the beginning of the program or a block), and the block will be looped infinitely as it always returns `1`.

**Add two numbers:**

```
[,.][,.].,
```

This program is very similar to _output `2`_, but uses two `[,.]` blocks instead of `[.]`. This will take input (`,`), and use it as the block's return value (`.`). You could also use `[,]`, but this would add the two inputs back into the queue (as the `,` is followed by the end of the block).

**[Truth-machine](https://esolangs.org/wiki/Truth-machine):**

```
[,].[.,]
```

This program is actually a pretty elegant display of many of dotcomma's features. The `[,]` block will take a number from the queue, re-add it, and assign it to the block's return value. If it is not `0`, the block `[.,]` (push `1` to the queue) will be looped infinitely.

**Subtract two numbers:**

```
[[,]][,]
.[
  [
    [,.][[].[],].,
  ]
  [
    [,.][[].[],].
  ],
]
[,][,.]
```

As this is the most complicated program so far, it's broken up into chunks. The first line, `[[,]][,]`, will return the value of the second item in the queue, assuming there are two. This is to ensure the second number (the one being subtracted from the first) isn't `0`.

Next is a loop consisting of two parts, which each decrement one of the items in the queue. The output of the second is also used as the loop block's return value, so that when it reaches `0` the loop ends. The final `[,][,.]` will remove the second item in the queue (the remaining `0`), leaving only the answer.
