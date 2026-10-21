import Icon from "../Icon";

type Props = {
  baseId: string;
  error?: string;
  help?: string;
};

const FieldMessage = ({ baseId, error, help }: Props) => {
  if (error) {
    return (
      <p id={`${baseId}-error`} className="field__error">
        <Icon name="alert-circle" />
        {error}
      </p>
    );
  }
  if (help) {
    return (
      <p id={`${baseId}-help`} className="field__help">
        {help}
      </p>
    );
  }
  return null;
};

export default FieldMessage;
