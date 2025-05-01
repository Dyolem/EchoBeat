export const stringUtils = {
  /**
   * 将连接符分隔的字符串每段首字母大写，并用指定分隔符连接
   * @param {string} str - 原始字符串，例如 "hello-world"
   * @param {string} splitter - 输出时的连接符，默认为空格
   * @returns {string}
   */
  upperFirstLetter(str, splitter = " ") {
    return str
      .split("-")
      .reduce((previousValue, currentValue, currentIndex) => {
        const capitalized =
          currentValue.charAt(0).toUpperCase() + currentValue.slice(1)
        return `${previousValue}${currentIndex > 0 ? splitter : ""}${capitalized}`
      }, "")
  },

  /**
   * 将字符串转为 camelCase，例如 "hello-world" => "helloWorld"
   * @param {string} str
   * @returns {string}
   */
  toCamelCase(str) {
    return str
      .split("-")
      .map((word, index) => {
        if (index === 0) return word.toLowerCase()
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join("")
  },

  /**
   * 将字符串转为 PascalCase，例如 "hello-world" => "HelloWorld"
   * @param {string} str
   * @returns {string}
   */
  toPascalCase(str) {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")
  },
}
