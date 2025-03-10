import React from 'react';
import {Helmet} from 'react-helmet-async';
import {useForm} from "react-hook-form";
import {FormError} from "../components/form-error";
import {gql, useMutation} from "@apollo/client";
import nuberLogo from "../images/logo.svg"
import {
    loginMutation,
    loginMutationVariables,
} from "../__generated__/loginMutation";
import {Button} from "../components/button";
import {Link} from 'react-router-dom'
import {authTokenVar, isLoggedInVar} from "../apollo";
import {LOCALSTORAGE_TOKEN} from "../constants";


interface ILoginForm {
    email: string;
    password: string;
}

const LOGIN_MUTATION = gql`
    mutation loginMutation($loginInput: LoginInput!) {
        login(input: $loginInput) {
            ok
            token
            error
        }
    }
`;


export const Login = () => {

    const {register, getValues, errors, handleSubmit, formState} = useForm<ILoginForm>({mode: "onChange"});

    const onCompleted = (data: loginMutation) => {
        const {
            login: {ok, token},
        } = data;
        if (ok && token) {
            localStorage.setItem(LOCALSTORAGE_TOKEN, token);
            authTokenVar(token);
            isLoggedInVar(true);
        }
    }


    const [loginMutation, {
        data: loginMutationResult,
        loading: loginLoading
    }] = useMutation<loginMutation, loginMutationVariables>(LOGIN_MUTATION, {
        onCompleted,
    });


    const onSubmit = async () => {
        if (!loginLoading) {
            const {email, password} = getValues();
            await loginMutation({
                variables: {
                    loginInput: {
                        email,
                        password,
                    }
                }
            })
        }
    }

    return (
        <div className='h-screen flex items-center flex-col mt-10 lg:mt-28'>
            <Helmet>
                <title>Login | Nuber Eats</title>
            </Helmet>
            <div className={'w-full max-w-screen-sm flex flex-col px-5 items-center'}>
                <img src={nuberLogo} alt={"Logo"} className="mb-10"/>
                <h4 className="w-full font-medium text-left text-3xl mb-7">Welcome Back</h4>
                <form onSubmit={handleSubmit(onSubmit)} className='grid gap-3 w-full mb-3'>
                    <input
                        ref={register({
                            required: "이메일은 필수 사항 입니다.",
                            pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                        })}
                        type={'email'}
                        placeholder={'Email'}
                        name={'email'}
                        required
                        className='input'
                    />
                    {errors.email?.message && (
                        <FormError errorMessage={errors.email?.message}/>
                    )}
                    {errors.email?.type === 'pattern' && (
                        <FormError errorMessage={"Please enter a valid email"}/>
                    )}
                    <input
                        ref={register({
                            required: "비밀번호는 필수 사항 입니다.",
                            minLength: 10
                        })}
                        type={'password'}
                        placeholder={'Password'}
                        name={'password'}
                        required
                        className='input'
                    />
                    {errors.password?.message && (
                        <FormError errorMessage={errors.password?.message}/>
                    )}
                    {errors.password?.type === "minLength" && (
                        <FormError errorMessage={'비밀번호는 최소 10글자 적어주세요'}/>
                    )}
                    <Button canClick={formState.isValid} loading={loginLoading} actionText={"Log In"}/>
                    {loginMutationResult?.login.error && <FormError errorMessage={loginMutationResult.login.error}/>}
                </form>
                <div>
                    New to Nuber ? <Link to={'/create-account'} className={'text-lime-600 hover:underline'}>Create an
                    Account</Link>
                </div>

            </div>
        </div>

    )
}