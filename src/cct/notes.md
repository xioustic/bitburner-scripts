My main complaint with coding contract so far (having completed / automated about 13 of them now) is that good lord, they do not have enough examples in so many cases.
- Should always give at least one hard example: INPUT => OUTPUT
- Maybe even generate them randomly.
- Maybe even an "API" that would provide a sample INPUT => OUTPUT on each call; the user could automatically test their solutions against that before submitting.

__**Hard Examples**__
- **Array Jumping Game II**: No example(s) given.
- **HammingCodes: Integer to Encoded Binary**: The couple examples are not very clear, really the problem isn't totally clear. It heavily leans on the 3Blue1Brown video (which is great), but it would be nice if it didn't have to.
- **Largest Prime Factor**: Not a single example, doesn't even try to explain what a factor or prime is. This might seem like "common knowledge" and Googling would get them there, but they're two distinct concepts combined into one.
- **Sanitize Parenthesis in Expression**: It is not made clear what makes the string "valid", just that to get there you must remove parenthesis. The examples seem good enough to cover everything.
- **Shortest Path in a Grid**: Good, could use one more example.
- **Stock Trader Series**: All need examples afaik. It's straightforward to be honest but example(s) would reinforce the player that they actually understand the problem before they start banging it out.
- **Subarray with Maximum Sum**: Could use examples; the words contiguous (and arguably subarray) isn't going to be known to all but an example(s) would immediately clear any questions up.
- **Unique Paths in a Grid I**: No examples...

A related complaint that really just applies to the entire game: Having a sandbox the solutions would execute in that wouldn't require the entire game / UI to crash if an infinite (recursive) loop happens would be good. Something like, throw the user's script in a web worker / (real) thread, pass the worker an input, wait for an output. If the script doesn't complete in x seconds prompt the user if they want to kill it (rather than restart the entire game). This is what an operating system with more than one core would be able to do.