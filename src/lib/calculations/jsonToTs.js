/**
 * Pure calculation utility to convert JSON into clean TypeScript definitions.
 */

function toPascalCase(str) {
   return str
      .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
      .replace(/^[a-z]/, (c) => c.toUpperCase());
}

function sanitizeKey(key) {
   if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
      return key;
   }
   return JSON.stringify(key);
}

export function convertJsonToTypeScript(jsonStr, options = {}) {
   const {
      rootName = 'RootObject',
      declarationType = 'interface', // 'interface' | 'type'
      exportKeywords = true,
      useReadonly = false,
      useOptional = false,
      indentSpaces = 2,
   } = options;

   let parsed;
   try {
      parsed = JSON.parse(jsonStr);
   } catch (err) {
      return {
         isValid: false,
         code: '',
         error: `Invalid JSON: ${err.message}`,
      };
   }

   const generatedInterfaces = [];
   const visited = new Map();
   const indent = ' '.repeat(indentSpaces);

   function inferType(val, keyHint = '') {
      if (val === null) return 'any | null';
      if (val === undefined) return 'undefined';

      const type = typeof val;
      if (type === 'string') return 'string';
      if (type === 'number') return 'number';
      if (type === 'boolean') return 'boolean';

      if (Array.isArray(val)) {
         if (val.length === 0) return 'any[]';
         // Check if array has primitive types or objects
         const sample = val[0];
         if (typeof sample === 'object' && sample !== null) {
            const singularHint = keyHint.endsWith('s') ? keyHint.slice(0, -1) : `${keyHint}Item`;
            const subTypeName = generateObjectInterface(sample, singularHint || 'Item');
            return `${subTypeName}[]`;
         }
         // Primitive array
         const innerType = inferType(sample, keyHint);
         return `${innerType}[]`;
      }

      if (type === 'object') {
         const subTypeName = generateObjectInterface(val, keyHint || 'NestedObject');
         return subTypeName;
      }

      return 'any';
   }

   function generateObjectInterface(obj, nameHint) {
      const typeName = toPascalCase(nameHint || 'Object');

      // Prevent duplicate identical interfaces
      const keys = Object.keys(obj).sort().join(',');
      if (visited.has(keys)) {
         return visited.get(keys);
      }
      visited.set(keys, typeName);

      const fields = [];
      const keysList = Object.keys(obj);

      for (const key of keysList) {
         const val = obj[key];
         const valType = inferType(val, key);
         const fieldName = sanitizeKey(key);
         const readonlyPrefix = useReadonly ? 'readonly ' : '';
         const optionalSuffix = useOptional ? '?' : '';

         fields.push(`${indent}${readonlyPrefix}${fieldName}${optionalSuffix}: ${valType};`);
      }

      const prefix = exportKeywords ? 'export ' : '';
      let definition = '';

      if (declarationType === 'interface') {
         definition = `${prefix}interface ${typeName} {\n${fields.join('\n')}\n}`;
      } else {
         definition = `${prefix}type ${typeName} = {\n${fields.join('\n')}\n};`;
      }

      generatedInterfaces.push(definition);
      return typeName;
   }

   if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
         generateObjectInterface(parsed[0], rootName);
      } else {
         const prefix = exportKeywords ? 'export ' : '';
         const itemType = parsed.length > 0 ? typeof parsed[0] : 'any';
         generatedInterfaces.push(`${prefix}type ${rootName} = ${itemType}[];`);
      }
   } else if (typeof parsed === 'object' && parsed !== null) {
      generateObjectInterface(parsed, rootName);
   } else {
      const prefix = exportKeywords ? 'export ' : '';
      generatedInterfaces.push(`${prefix}type ${rootName} = ${typeof parsed};`);
   }

   return {
      isValid: true,
      code: generatedInterfaces.reverse().join('\n\n'),
      error: null,
   };
}

