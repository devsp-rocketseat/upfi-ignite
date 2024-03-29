import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

interface FormValues {
  url: string;
  title: string;
  description: string;
}

const imagesTypes = ['jpeg', 'png', 'gif'];

const formValidations = {
  image: {
    required: 'Arquivo obrigatório',
    validate: {
      lessThan10MB: (value: FileList) => {
        // transformando em mb
        const number = Number(value[0].size) / 1024 / 1024;
        return number < 10 ? true : 'O arquivo deve ser menor que 10M';
      },
      acceptedFormats: (value: FileList) => {
        // transformando em mb
        const type = (value[0].type.match(/\/[0-9a-z]+$/i) ?? [''])[0].slice(1);
        const validType = imagesTypes.some(t => t === type);
        return validType
          ? true
          : 'Somente são aceitos arquivos PNG, JPEG e GIF';
      },
    },
  },
  title: {
    required: 'Título obrigatório',
    minLength: { value: 2, message: 'Mínimo de 2 caracteres' },
    maxLength: { value: 20, message: 'Máximo de 20 caracteres' },
  },
  description: {
    required: 'Descrição obrigatória',
    maxLength: { value: 65, message: 'Máximo de 65 caracteres' },
  },
};

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const queryClient = useQueryClient();
  const mutation = useMutation(
    (values: FormValues) => api.post('/api/images', values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit = async (data: Record<string, unknown>): Promise<void> => {
    try {
      if (imageUrl) {
        await mutation.mutateAsync({
          url: imageUrl,
          title: String(data.title),
          description: String(data.description),
        });

        toast({
          title: 'Imagem cadastrada',
          description: 'Sua imagem foi cadastrada com sucesso.',
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Imagem não adicionada',
          description:
            'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });

        return;
      }
    } catch (err) {
      toast({
        title: 'Falha no cadastro',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      reset();
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          name="image"
          error={errors.image}
          {...register('image', formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          error={errors.title}
          {...register('title', formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          error={errors.description}
          {...register('description', formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
