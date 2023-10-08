type ZodType =
  | ZodUnknown
  | ZodString
  | ZodNumber
  | ZodArray<ZodType>
  | ZodObject<Record<string, ZodType>>;

interface ZodUnknown {
  type: "unknown";
  parse(val: unknown): unknown;
}

interface ZodString {
  type: "string";
  parse(val: unknown): string;
}

interface ZodNumber {
  type: "number";
  parse(val: unknown): number;
}

interface ZodArray<T extends ZodType> {
  type: "array";
  element: T;
  parse(val: unknown): Array<Infer<T>>;
}

interface ZodObject<T extends Record<string, ZodType>> {
  type: "object";
  fields: T;
  parse(val: unknown): InferZodObject<ZodObject<T>>;
}

type Infer<T extends ZodType> = T extends ZodUnknown
  ? unknown
  : T extends ZodString
  ? string
  : T extends ZodNumber
  ? number
  : T extends ZodArray<infer E>
  ? Array<Infer<E>>
  : T extends ZodObject<Record<string, ZodType>> // <-- over here
  ? InferZodObject<T>
  : "invalid type";

type InferZodObject<T extends ZodObject<Record<string, ZodType>>> = {
  [Key in keyof T["fields"]]: Infer<T["fields"][Key]>;
};

const string = (): ZodString => ({
  type: "string",
  parse(val): string {
    if (typeof val !== "string") throw new Error("Not a string");
    return val;
  },
});

const number = (): ZodNumber => ({
  type: "number",
  parse(val): number {
    if (typeof val !== "number") throw new Error("Not a number");
    return val;
  },
});

const unknown = (): ZodUnknown => ({
  type: "unknown",
  parse(val): unknown {
    return val;
  },
});

const array = <T extends ZodType>(element: T): ZodArray<T> => ({
  type: "array",
  element,
  parse(val): Array<Infer<T>> {
    if (!Array.isArray(val)) throw new Error("Not an array");

    // Check that each element in `val` can be parsed by `this.element`
    val.forEach((v) => this.element.parse(v));

    return val;
  },
});

const object = <T extends Record<string, ZodType>>(
  fields: T
): ZodObject<T> => ({
  type: "object",
  fields,
  parse(val): InferZodObject<ZodObject<T>> {
    if (typeof val !== "object" || val == null)
      throw new Error("Not an object");

    // Have to type cast here
    const recordVal = val as Record<string, unknown>;

    // Check that each key in `this.fields` is present in the `val`, and its
    // value parses by the corresponding entry in `val`
    Object.entries(this.fields).forEach(([k, v]) => v.parse(recordVal[k]));

    // Have to do some type casting here too
    return val as InferZodObject<ZodObject<T>>;
  },
});

export const z = {
  string,
  number,
  unknown,
  array,
  object,
};
