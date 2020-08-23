// code: A string containing dotcomma code
// input: A string or array of numbers, bigints, and/or strings
// string_out: Whether to output as a string of characters (true) or array of bigints (false), defaults to true if input is a string

function interpret(code, input = [], string_out = undefined) {
    
    // Define useful function(s)
    
    var to_id = function(char) {
        return [1, 0, 0, -1]["[.,]".indexOf(char)];
    };
    
    // Validate and format input
    
    switch (typeof input) {
        case "number":
            input = [BigInt(Math.trunc(input || 0))];
            break;
        case "bigint":
            input = [input];
            break;
        case "string":
            string_out = string_out === undefined ? true : string_out;
            input = input.split("").map(c => BigInt(c.codePointAt(0))).reverse();
            break;
        case "boolean":
            input = [input ? 1 : 0];
            break;
        default:
            if (!Array.isArray(input))
                throw "Invalid input";
            input = [].concat.apply([], input.map((i, n) => {
                switch (typeof i) {
                    case "number":
                        return [BigInt(Math.trunc(i || 0))];
                    case "bigint":
                        return [i];
                    case "string":
                        return i.split("").map(c => BigInt(c.codePointAt(0))).reverse();
                    case "boolean":
                        return [i ? 1 : 0];
                    default:
                        throw "Invalid input: input[" + n + "]";
                }
            })).reverse();
    }
    
    // Remove comments and detect unbalanced brackets
    
    code = code.replace(/[^[.,\]]+/g, "");
    
    {
        let depth = 0;
        
        for (let i = 0; i < code.length; i++) {
            depth += to_id(code[i]);
            
            if (depth < 0)
                throw "Unbalanced brackets";
        }
        
        if (depth)
            throw "Unbalanced brackets";
    }
    
    // Ensure code is wrapped in brackets
    
    for (let d = 0, i = 0; i < code.length - 1; i++) {
        d += to_id(code[i]);

        if (!d) {
            code = "[" + code + "]";
            break;
        }
    }
    
    // Interpret
    
    var ptr = 0;
    var blocks = [];
    var last = 0n;
    var loop = [];
    var queue = [...input];
    
    var parent = function() {
        var result = blocks;
        var next = result[result.length - 1];
        
        while (Array.isArray(next[next.length - 1])) {
            result = result[result.length - 1];
            next = next[next.length - 1];
        }
        
        return result;
    };
    
    var block = function() {
        var result = blocks;
        
        while (Array.isArray(result[result.length - 1]))
            result = result[result.length - 1];
        
        return result;
    };
    
    var alternative = function(data) {
        if (data === undefined || data === null)
            return -1n;
        return data;
    };
    
    while (ptr < code.length) {
        switch (code[ptr]) {
            case "[":
                if (code[ptr - 1] == "," && last < 0) {
                    
                    for (let d = 0, i = ptr; i < code.length; i++) {
                        d += to_id(code[i]);
                        if (!d) {
                            ptr = i;
                            break;
                        }
                    }
                    
                    block().push(null);
                    last = 0n;
                    
                    break;
                }
                
                if (code[ptr - 1] == "." && !last) {
                    for (let d = 0, i = ptr; i < code.length; i++) {
                        d += to_id(code[i]);
                        if (!d) {
                            ptr = i;
                            break;
                        }
                    }

                    block().push(null);
                    last = 0n;

                    break;
                }
                
                block().push([]);
                loop.push(code[ptr - 1] == ".");
                last = 0n;
                
                break;
            case ".":
                if (code[ptr - 1] == "[")
                    last = 1n;
                if (code[ptr - 1] == "]")
                    last = block().reduce((a, r) => a + (r || 0n), 0n);
                block().length = 0;
                break;
            case ",":
                if (code[ptr - 1] == "[")
                    last = alternative(queue.pop());
                else if (code[ptr - 1] == "]")
                    last = alternative(block().pop());
                block.length = 0;
                if (code[ptr + 1] == "]" && last >= 0)
                    queue.unshift(last);
                break;
            case "]":
                parent().pop();
                block().push(last);
                
                if (loop.pop()) {
                    if (last) {
                        for (let d = 0, i = ptr; i >= 0; i--) {
                            d += to_id(code[i]);
                            if (!d) {
                                ptr = i;
                                break;
                            }
                        }
                        
                        block().push([]);
                        loop.push(true);
                        last = 0n;
                        
                        break;
                    }
                }
                
                last = 0n;
                
                break;
        }
        
        ptr += 1;
    }
    
    // Return output, by default formats as string if input was string
    
    queue.reverse();
    
    try {
        return string_out ? queue.map(c => String.fromCodePoint(Number(BigInt.asIntN(32, c)))).join("") : queue;
    } catch (e) {
        return queue;
    }
}
