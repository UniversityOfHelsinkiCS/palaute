/* 
  Tool for checking missing translations

  Usage: paste the contents of fi.js (excluding first and last line) 
  from locales to const fi and then  paste either en.js or sv.js to the const sv

  After this run node keys.js and missing keys (or objects) will be printed to terminal
*/

const fi = {}

const sv = {}

const checkMissingKeys = () => {
  const finnishObjectKeys = Object.keys(fi)
  for (objectKey of finnishObjectKeys) {
    const objectValueKeys = Object.keys(fi[objectKey])
    if (!objectKey in sv) {
      console.log('objectKey missing', objectKey)
    }
    for (valueKey of objectValueKeys) {
      if (!sv[objectKey]) {
        console.log('no object', objectKey)
      } else if (!sv[objectKey][valueKey]) {
        console.log('no key', valueKey, 'in object', objectKey)
      }
    }
  }
}

checkMissingKeys()
