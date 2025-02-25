export default function CodeBlock() {
  const codeString = `query localization($inContext: country: CA, language: FR) {
  localization {
    # for the current country
    availableLanguages {
      isoCode
      endonymName
    }
    # and for non-current countries
    availableCountries {
      isoCode
      name
      availableLanguages {
        isoCode
        endonymName
      }
    }
  }
}`

  return (
    <div className="relative rounded-lg bg-[#1e1e1e] p-4 text-white">
      <pre className="overflow-x-auto text-sm">
        <code>{codeString}</code>
      </pre>
    </div>
  )
}

