export function buildIntlSelectionList(options, intl, messages) {
  return Object.values(options)
    .map(
      option => (
        {
          label: intl.formatMessage(messages[option]),
          value: option,
        }
      ),
    );
}
