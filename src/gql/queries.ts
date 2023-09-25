import { gql } from "graphql-request";

export const createExchangerMutation = gql`
  mutation createPhysicalExchanger(
    $lng: Float!
    $lat: Float!
    $contact: String!
  ) {
    createPhysicalExchanger(
      data: { lng: $lng, lat: $lat, contact: $contact, opened: true }
    ) {
      data {
        id
        attributes {
          contact
        }
      }
    }
  }
`;

export const AuthMutation = gql`
  mutation login($identifier: String!, $password: String!) {
    login(
      input: { identifier: $identifier, password: $password, provider: "local" }
    ) {
      jwt
      user {
        username
        email
      }
    }
  }
`;

export const uploadMutation = gql`
  mutation SingleImageUpload(
    $refId: ID
    $ref: String
    $field: String
    $info: FileInfoInput
    $file: Upload!
  ) {
    upload(refId: $refId, ref: $ref, field: $field, file: $file, info: $info) {
      data {
        id
        attributes {
          name
          createdAt
          updatedAt
        }
      }
    }
  }
`;
