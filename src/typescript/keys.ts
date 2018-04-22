module keys {

    export const Key: {[k: string]: string[]} = {
        Left: ['Left', 'ArrowLeft'],
        Right: ['Right', 'ArrowRight'],
        Up: ['Up', 'ArrowUp'],
        Down: ['Down', 'ArrowDown'],
        Esc: ['Esc', 'Escape'],
        Enter: ['Enter', 'Return'],
        Plus: ['+Equal', '+']
    }

    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        .split('')
        .forEach(k => Key[k] = [k, `Key${k}`])

    export const isKey = (ev: KeyboardEvent, ...keys: Array<String[]>): Boolean => {
        const flat: string[] = [].concat(...keys)
        return !!flat.find((k: string) => {
            const code = ev.code || ev.key
            if (k.charAt(0) === '+' && k.length > 1) {
                return ev.shiftKey && k.substr(1).toLocaleLowerCase() === code.toLowerCase()
            }
            return k.toLocaleLowerCase() === code.toLowerCase()
        })
    }
}
